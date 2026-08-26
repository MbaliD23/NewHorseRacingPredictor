import { useLocation, useParams } from "react-router-dom";
import { HorseVideoView } from "@/components/horse/HorseVideoView";

export function HorseVideoPage() {
  const { horseId } = useParams();
  const location = useLocation();

  const returnUrl = location.pathname.startsWith("/predictions")
    ? horseId
      ? `/predictions/horses/${horseId}`
      : "/predictions/results"
    : horseId
    ? `/horses/${horseId}`
    : "/";

  return (
    <section className="w-full h-full min-h-0 py-0">
      <HorseVideoView horseId={horseId} returnUrl={returnUrl} />
    </section>
  );
}
