import { onBeforeUnmount, reactive, ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TButton, TFileUpload } from '@treeui/vue';
import type {
  TFileUploadRetryPayload,
  TFileUploadState,
} from '@treeui/vue';

const meta = {
  title: 'Components/Form/FileUpload',
  component: TFileUpload,
  tags: ['autodocs'],
  args: {
    size: 'md',
    multiple: true,
    accept: 'image/*,.pdf',
    maxFiles: 5,
    label: 'Upload files',
    description: 'Drag and drop, browse, or paste screenshots with Ctrl+V.',
    buttonLabel: 'Choose files',
    filesLabel: 'Attached files',
    paste: true,
    drop: true,
    showFileList: true,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    maxFiles: {
      control: 'number',
    },
    maxFileSize: {
      control: 'number',
    },
    thumbnails: {
      control: 'boolean',
    },
    dragLabel: {
      control: 'text',
    },
    dragRejectLabel: {
      control: 'text',
    },
  },
} satisfies Meta<typeof TFileUpload>;

export default meta;

type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ *
 * Simulation helpers for the upload-signal stories.
 * The component never uploads anything — it renders the state a
 * consumer reports through `uploadState` and emits intent back.
 * ------------------------------------------------------------------ */

const TICK_MS = 250;

const captionStyle =
  'margin: 0; font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);';

const createFile = (name: string, type: string, size: number) =>
  new File([new Uint8Array(size)], name, { type });

/** Exponentially smoothed throughput — an honest ETA never jumps around. */
const smoothRate = (previous: number, sample: number) => previous * 0.7 + sample * 0.3;

const uploadingState = (
  file: File,
  uploaded: number,
  bytesPerSecond: number,
): TFileUploadState => ({
  status: 'uploading',
  progress: (uploaded / file.size) * 100,
  uploadedBytes: Math.round(uploaded),
  remainingMs: ((file.size - uploaded) / bytesPerSecond) * 1000,
});

const tokenColor = (name: string, fallback: string) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  return value || fallback;
};

/** Paints a real PNG on a canvas so the thumbnail in Signal 04 is genuine proof. */
const createImageFile = (name: string, width: number, height: number, seed: number) =>
  new Promise<File | null>((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    if (!context) {
      resolve(null);
      return;
    }

    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, tokenColor('--tree-color-chart-1', '#2a78d6'));
    gradient.addColorStop(1, tokenColor('--tree-color-chart-4', '#8957e5'));
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.fillStyle = tokenColor('--tree-color-bg-surface', '#ffffff');
    context.globalAlpha = 0.22;

    for (let index = 0; index < 24; index += 1) {
      context.beginPath();
      context.arc(
        (index * 97 + seed * 41) % width,
        (index * 61 + seed * 23) % height,
        ((index * 37 + seed * 61) % Math.min(width, height)) / 2.4,
        0,
        Math.PI * 2,
      );
      context.fill();
    }

    context.globalAlpha = 1;

    canvas.toBlob((blob) => {
      resolve(blob ? new File([blob], name, { type: 'image/png' }) : null);
    }, 'image/png');
  });

/** Real digest of the real bytes — the checksum shown as `state.meta` is not decorative. */
const sha256Short = async (file: File) => {
  try {
    if (!globalThis.crypto?.subtle) {
      return undefined;
    }

    const digest = await globalThis.crypto.subtle.digest('SHA-256', await file.arrayBuffer());
    const hex = Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');

    return `sha256:${hex.slice(0, 12)}`;
  } catch {
    return undefined;
  }
};

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TFileUpload },
    setup: () => {
      const files = ref<File[]>([]);
      return { args, files };
    },
    template: `
      <div style="width: min(100%, 36rem);">
        <TFileUpload v-bind="args" v-model="files" />
        <p style="margin: 0.75rem 0 0; font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Selected files: {{ files.length }}
        </p>
      </div>
    `,
  }),
};

export const SingleFile: Story = {
  render: () => ({
    components: { TFileUpload },
    setup: () => {
      const files = ref<File[]>([]);
      return { files };
    },
    template: `
      <div style="width: min(100%, 32rem);">
        <TFileUpload
          v-model="files"
          :multiple="false"
          accept="image/*"
          label="Profile picture"
          description="Drop or paste a single image."
          button-label="Choose image"
        />
      </div>
    `,
  }),
};

export const CustomFileRow: Story = {
  render: () => ({
    components: { TFileUpload },
    setup: () => {
      const files = ref<File[]>([
        new File(['brief'], 'creative-brief.pdf', { type: 'application/pdf' }),
        new File(['mockup'], 'hero-shot.png', { type: 'image/png' }),
      ]);

      return { files };
    },
    template: `
      <div style="width: min(100%, 36rem);">
        <TFileUpload
          v-model="files"
          accept="image/*,.pdf"
          label="Assets"
          description="Keep campaign files together in one place."
          :thumbnails="false"
        >
          <template #file="{ file, removeFile }">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; width: 100%;">
              <div style="display: grid; gap: 0.2rem;">
                <strong>{{ file.name }}</strong>
                <span style="font-size: var(--tree-font-size-xs); color: var(--tree-color-text-muted);">
                  {{ file.type || 'Unknown type' }}
                </span>
              </div>
              <button
                type="button"
                style="border: 0; background: transparent; color: var(--tree-color-brand-primary); cursor: pointer;"
                @click="removeFile()"
              >
                Remove
              </button>
            </div>
          </template>
        </TFileUpload>
      </div>
    `,
  }),
};

/**
 * SIGNAL 02 — Honest progress.
 * A spinner never says whether 2 seconds or 20 remain. This row reports a real
 * percentage and a real remaining time, both recomputed from a jittery simulated
 * throughput and smoothed so the ETA counts down instead of flickering.
 */
export const HonestProgress: Story = {
  name: 'Honest Progress (Signal 02)',
  render: () => ({
    components: { TButton, TFileUpload },
    setup: () => {
      const file = createFile('quarterly-report.pdf', 'application/pdf', 2_516_582);
      const files = ref<File[]>([file]);
      const uploads = reactive(new Map<File, TFileUploadState>());

      const BYTES_PER_SECOND = 140_000;
      let uploaded = 0;
      let rate = BYTES_PER_SECOND;

      const start = () => {
        uploaded = 0;
        rate = BYTES_PER_SECOND;
        uploads.set(file, uploadingState(file, uploaded, rate));
      };

      const tick = () => {
        if (uploads.get(file)?.status !== 'uploading') {
          return;
        }

        const sample = BYTES_PER_SECOND * (0.7 + Math.random() * 0.6);
        rate = smoothRate(rate, sample);
        uploaded = Math.min(file.size, uploaded + (sample * TICK_MS) / 1000);

        uploads.set(
          file,
          uploaded >= file.size
            ? { status: 'success', progress: 100, uploadedBytes: file.size }
            : uploadingState(file, uploaded, rate),
        );
      };

      start();

      const timer = window.setInterval(tick, TICK_MS);

      onBeforeUnmount(() => {
        window.clearInterval(timer);
      });

      return { files, uploads, start };
    },
    template: `
      <div style="width: min(100%, 36rem); display: grid; gap: var(--tree-space-3);">
        <TFileUpload
          v-model="files"
          :upload-state="uploads"
          accept="application/pdf"
          label="Quarterly report"
          description="Percentage and remaining time, ticking — enough to decide between waiting and leaving."
        />

        <div style="display: flex; align-items: center; gap: var(--tree-space-3);">
          <TButton
            size="sm"
            variant="outline"
            @click="start()"
          >
            Replay upload
          </TButton>
          <p style="${captionStyle}">
            The status line follows the shape
            <code>Uploading · 62% · About 12s left</code>, recomputed every ${TICK_MS}ms.
          </p>
        </div>
      </div>
    `,
  }),
};

/**
 * SIGNAL 05 + SIGNAL 03 — Independent queue that resumes.
 * Five files, five tracks. `keynote-cut.mov` drops its connection at ~55% while the
 * other four keep climbing — one failure never blocks the others. The bar holds the
 * 55% it already earned, the status line proves how many bytes survived, and Retry
 * reads "Resume from 55%" because the consumer marked the file `resumable`.
 */
export const IndependentQueue: Story = {
  name: 'Independent Queue & Resume (Signals 05 + 03)',
  render: () => ({
    components: { TButton, TFileUpload },
    setup: () => {
      interface Track {
        file: File;
        bytesPerSecond: number;
        failRatio: number;
        uploaded: number;
        rate: number;
        failAtBytes: number | null;
      }

      const createTrack = (
        name: string,
        type: string,
        size: number,
        bytesPerSecond: number,
        failRatio = 0,
      ): Track => ({
        file: createFile(name, type, size),
        bytesPerSecond,
        failRatio,
        uploaded: 0,
        rate: bytesPerSecond,
        failAtBytes: null,
      });

      const tracks: Track[] = [
        createTrack('client-brief.pdf', 'application/pdf', 860_000, 130_000),
        createTrack('brand-guide.pdf', 'application/pdf', 1_240_000, 70_000),
        createTrack('keynote-cut.mov', 'video/quicktime', 2_400_000, 120_000, 0.55),
        createTrack('press-kit.zip', 'application/zip', 1_800_000, 55_000),
        createTrack('soundtrack.wav', 'audio/wav', 3_100_000, 160_000),
      ];

      const files = ref<File[]>(tracks.map((track) => track.file));
      const uploads = reactive(new Map<File, TFileUploadState>());
      const retryLog = ref<string | null>(null);

      const percentOf = (track: Track) => Math.round((track.uploaded / track.file.size) * 100);

      const start = () => {
        retryLog.value = null;

        for (const track of tracks) {
          track.uploaded = 0;
          track.rate = track.bytesPerSecond;
          track.failAtBytes = track.failRatio > 0
            ? Math.round(track.file.size * track.failRatio)
            : null;
          uploads.set(track.file, uploadingState(track.file, 0, track.rate));
        }
      };

      const tick = () => {
        for (const track of tracks) {
          if (uploads.get(track.file)?.status !== 'uploading') {
            continue;
          }

          const sample = track.bytesPerSecond * (0.75 + Math.random() * 0.5);
          track.rate = smoothRate(track.rate, sample);

          const next = track.uploaded + (sample * TICK_MS) / 1000;

          if (track.failAtBytes !== null && next >= track.failAtBytes) {
            track.uploaded = track.failAtBytes;
            // Cleared, so the retry RESUMES and finishes — it never repeats this work.
            track.failAtBytes = null;

            uploads.set(track.file, {
              status: 'error',
              progress: (track.uploaded / track.file.size) * 100,
              uploadedBytes: Math.round(track.uploaded),
              error: `Connection lost at ${percentOf(track)}%.`,
              resumable: true,
            });
            continue;
          }

          track.uploaded = Math.min(track.file.size, next);

          uploads.set(
            track.file,
            track.uploaded >= track.file.size
              ? { status: 'success', progress: 100, uploadedBytes: track.file.size }
              : uploadingState(track.file, track.uploaded, track.rate),
          );
        }
      };

      const onRetry = (payload: TFileUploadRetryPayload) => {
        const track = tracks.find((candidate) => candidate.file === payload.file);

        if (!track) {
          return;
        }

        retryLog.value =
          `retry emitted { mode: '${payload.mode}' } for ${payload.file.name} — ` +
          `resumed at ${percentOf(track)}%, keeping the bytes already uploaded.`;

        // The resume contract: uploaded bytes are NOT reset to zero.
        uploads.set(track.file, uploadingState(track.file, track.uploaded, track.rate));
      };

      start();

      const timer = window.setInterval(tick, TICK_MS);

      onBeforeUnmount(() => {
        window.clearInterval(timer);
      });

      return { files, uploads, retryLog, start, onRetry };
    },
    template: `
      <div style="width: min(100%, 40rem); display: grid; gap: var(--tree-space-3);">
        <TFileUpload
          v-model="files"
          label="Campaign delivery"
          description="Each file gets its own bar, its own error, and its own retry."
          files-label="Queue"
          :thumbnails="false"
          :upload-state="uploads"
          @retry="onRetry"
        />

        <div style="display: flex; align-items: center; gap: var(--tree-space-3); flex-wrap: wrap;">
          <TButton
            size="sm"
            variant="outline"
            @click="start()"
          >
            Restart queue
          </TButton>
          <p style="${captionStyle}">
            Watch <strong>keynote-cut.mov</strong> fail at ~55% — the other four never stop.
          </p>
        </div>

        <p
          v-if="retryLog"
          style="${captionStyle} color: var(--tree-color-status-success);"
        >
          {{ retryLog }}
        </p>
      </div>
    `,
  }),
};

/**
 * SIGNAL 04 — Confirmation with proof.
 * A filename only proves that something happened. These rows render a thumbnail
 * decoded from the real image bytes, the real decoded dimensions, the real byte
 * size, and a real SHA-256 of the file passed through `state.meta`.
 */
export const ConfirmationWithProof: Story = {
  name: 'Confirmation With Proof (Signal 04)',
  render: () => ({
    components: { TFileUpload },
    setup: () => {
      const files = ref<File[]>([]);
      const uploads = reactive(new Map<File, TFileUploadState>());
      let isCancelled = false;

      onBeforeUnmount(() => {
        isCancelled = true;
      });

      void (async () => {
        const created = await Promise.all([
          createImageFile('hero-banner.png', 1200, 800, 0),
          createImageFile('team-avatar.png', 640, 640, 5),
        ]);

        const ready = created.filter((file): file is File => file !== null);
        const metas = await Promise.all(ready.map((file) => sha256Short(file)));

        if (isCancelled) {
          return;
        }

        ready.forEach((file, index) => {
          uploads.set(file, {
            status: 'success',
            progress: 100,
            uploadedBytes: file.size,
            meta: metas[index],
          });
        });

        files.value = ready;
      })();

      return { files, uploads };
    },
    template: `
      <div style="width: min(100%, 36rem); display: grid; gap: var(--tree-space-3);">
        <TFileUpload
          v-model="files"
          :upload-state="uploads"
          accept="image/*"
          label="Press images"
          description="Thumbnail, type, size, checksum — that is what turns 'something happened' into confirmation."
        />

        <p style="${captionStyle}">
          Every value on the meta line — <code>PNG · size · 1200 × 800 · sha256:…</code> — is read
          back from the real bytes: the size is the encoded PNG's own, the dimensions are decoded
          from the image, and the checksum is a genuine SHA-256. The component mints the preview
          object URL itself and revokes it on unmount.
        </p>
      </div>
    `,
  }),
};
