import type { Product, CategoryId } from "../data/products";

/** Original project-specific artwork; one shared atlas avoids six separate downloads. */
const scenes: Record<
  Product["art"],
  { column: number; row: number; label: string }
> = {
  meadow: {
    column: 0,
    row: 0,
    label: "مزرعة ريفية أصلية ببيت دافئ وحظيرة حمراء وحديقة مزهرة",
  },
  plan: {
    column: 1,
    row: 0,
    label: "مخطط مزرعة منظم بحقول متنوعة وطاحونة وممرات ذهبية",
  },
  orchard: {
    column: 2,
    row: 0,
    label: "بستان تفاح وطاولة تخطيط وسلة حصاد بين الأشجار المثمرة",
  },
  garden: {
    column: 0,
    row: 1,
    label: "حديقة زهور مزينة ببركة وجسر خشبي وجلسة ريفية",
  },
  village: {
    column: 1,
    row: 1,
    label: "مزرعة صغيرة مرحة مع خراف ودجاج وحقول حديثة الزراعة",
  },
  sunset: {
    column: 2,
    row: 1,
    label: "مزرعة خريفية عند الغروب مع أشجار برتقالية وقرع وفوانيس",
  },
};

export function FarmArt({
  variant = "meadow",
  hero = false,
}: {
  variant?: Product["art"];
  hero?: boolean;
}) {
  if (hero)
    return (
      <img
        className="farm-art hero-art"
        src="/artwork/farm-world.webp"
        alt="عالم فارم ماركت: بيت ريفي وحظيرة حمراء وحقول خضراء وأشجار وزهور وحيوانات المزرعة تحت سماء زرقاء"
        width="1536"
        height="1024"
        fetchPriority="high"
      />
    );
  const scene = scenes[variant];
  return (
    <svg
      className={`farm-art scene-art scene-${variant}`}
      viewBox="0 0 512 512"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={scene.label}
    >
      <image
        href="/artwork/service-worlds.webp"
        x={-scene.column * 512}
        y={-scene.row * 512}
        width="1536"
        height="1024"
      />
    </svg>
  );
}

const categoryScenes: Record<CategoryId, Product["art"]> = {
  consultation: "orchard",
  layout: "plan",
  coaching: "village",
  decoration: "garden",
};
export function CategoryArt({ category }: { category: CategoryId }) {
  return (
    <div className="category-art" aria-hidden="true">
      <FarmArt variant={categoryScenes[category]} />
    </div>
  );
}
