import { ButterflyIcon, LeafSmallIcon, FlowerIcon, CherryIcon, CitrusIcon, MushroomIcon } from "./icons";

const items = [
  { Icon: ButterflyIcon, x: "5%", y: "15%", delay: 0, color: "#EC4899" },
  { Icon: LeafSmallIcon, x: "85%", y: "10%", delay: 0.5, color: "#10B981" },
  { Icon: FlowerIcon, x: "90%", y: "45%", delay: 1, color: "#F59E0B" },
  { Icon: CherryIcon, x: "8%", y: "70%", delay: 1.5, color: "#EF4444" },
  { Icon: ButterflyIcon, x: "92%", y: "75%", delay: 2, color: "#8B5CF6" },
  { Icon: CitrusIcon, x: "3%", y: "40%", delay: 0.8, color: "#F59E0B" },
  { Icon: MushroomIcon, x: "95%", y: "25%", delay: 1.2, color: "#78716C" },
  { Icon: LeafSmallIcon, x: "6%", y: "90%", delay: 1.8, color: "#10B981" },
];

export default function BotanicalBackground() {
  return (
    <div className="botanical-bg" aria-hidden="true">
      {items.map((item, i) => (
        <div
          key={i}
          className="botanical-float"
          style={{
            left: item.x,
            top: item.y,
            animationDelay: `${item.delay}s`,
            color: item.color,
          }}
        >
          <item.Icon size={24} />
        </div>
      ))}
    </div>
  );
}
