# Cinematic asset guide

| Asset | Visual reading / ratio | Purpose and location | Theme / mobile | Audio / loop | Notes |
| --- | --- | --- | --- | --- | --- |
| `make_this_justice_weighing_som.mp4` | Lady Justice weighing scales; widescreen, 10 s | Landing hero | Dark-first; hidden on reduced-motion and small screens | Audio track present; muted, loopable | Used as a low-opacity atmospheric layer only. |
| `https_dribbblecom_shots_.mp4` | Court-inspired motion treatment; widescreen, 10 s | Reserved for future campaign/section visual | Desktop only | Audio track present; muted, loopable | Not used by default so the product experience stays restrained. |
| `i_want_to_make_a_video_with_go.mp4` | Court/dawn-style generated motion; widescreen, 10 s | Available to `CinematicBackground` as the `dawn` variant | Light-mode editorial sections; desktop only | Audio track present; muted, loopable | A fallback still remains in place while metadata loads. |
| `Supreme-court.jpeg` | Indian Supreme Court with Lady Justice; 4:3 | Hero fallback, dashboards and decorative architecture | Both; safe for mobile | No audio / static | Used under dark/light overlays to ensure readable text. |

All video implementations use `muted`, `autoPlay`, `loop`, and `playsInline`. No asset provides user-facing audio.
