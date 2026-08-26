import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Film } from "lucide-react";
import { BackButton } from "@/components/navigation/BackButton";
import animationHorseVideo from "@/assets/animation horse video.mp4";

interface HorseVideoViewProps {
  horseId?: string | number | null;
  returnUrl?: string;
}

export function HorseVideoView({
  horseId,
  returnUrl,
}: HorseVideoViewProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);

  const fallbackReturnUrl = useMemo(() => {
    if (returnUrl) return returnUrl;
    if (location.pathname.startsWith("/predictions/horses")) {
      return horseId ? `/predictions/horses/${horseId}` : "/predictions/results";
    }
    return horseId ? `/horses/${horseId}` : "/";
  }, [returnUrl, location.pathname, horseId]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Ensure instant autoplay as soon as the page opens
      video.defaultMuted = true;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Autoplay attempt:", err);
          // Try again explicitly
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    }

    return () => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto h-full flex flex-col p-1 sm:p-2.5 transition-all duration-300 ease-in-out text-gray-800 dark:text-slate-200">
      <div className="space-y-4 sm:space-y-5 rounded-3xl border border-purple-100/80 dark:border-slate-800/80 bg-white dark:bg-[#121324] p-[clamp(0.875rem,1.8vw,1.5rem)] shadow-[0_10px_40px_rgba(139,92,246,0.06)] dark:shadow-none transition-all duration-300 ease-in-out">
        {/* Header Control Bar without horse details */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-purple-100/70 dark:border-slate-800/70">
          <div className="flex items-center gap-3">
            <BackButton
              to={fallbackReturnUrl}
              fallbackTo={fallbackReturnUrl}
              label="Back"
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current) {
                  videoRef.current.pause();
                }
                navigate(fallbackReturnUrl);
              }}
            />
            <span className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300">
              Back
            </span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-bold">
            <Film className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
            <span>Horse Display</span>
          </div>
        </div>

        {/* Dedicated Full-Frame Video Player Container */}
        <div className="w-full pt-2 pb-4">
          <div className="aspect-video max-w-5xl mx-auto rounded-2xl shadow-2xl overflow-hidden bg-black/90 border border-purple-900/40 p-2 flex items-center justify-center">
            <video
              ref={videoRef}
              controls
              autoPlay
              muted
              playsInline
              className="w-full h-full rounded-2xl object-cover"
              src={animationHorseVideo}
            >
              Your browser does not support HTML5 video playback.
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}
