import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const OUT_DIR = path.join(process.cwd(), "public", "players");

const IMAGES: { file: string; url: string }[] = [
  { file: "lebron-james.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/6/60/Lebron_dunking_finals_2016.jpg" },
  { file: "klay-thompson.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/d/de/Klay_Thompson_vs._Jared_Dudley.jpg" },
  {
    file: "giannis-antetokounmpo.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Giannis_Antetokounmpo_%2851916230730%29.jpg/500px-Giannis_Antetokounmpo_%2851916230730%29.jpg",
  },
  {
    file: "nikola-jokic.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Nikola_Jokic_%2840980299891%29.jpg/500px-Nikola_Jokic_%2840980299891%29.jpg",
  },
  {
    file: "luka-doncic.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Luka_Doncic_vs_Dean_Wade%2C_Dallas_Mavericks_vs_Cleveland_Cavaliers_on_May_9%2C_2021.jpg/500px-Luka_Doncic_vs_Dean_Wade%2C_Dallas_Mavericks_vs_Cleveland_Cavaliers_on_May_9%2C_2021.jpg",
  },
  {
    file: "joel-embiid.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Joel_Embiid_layup_2019.jpg/500px-Joel_Embiid_layup_2019.jpg",
  },
  {
    file: "devin-booker.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Devin_Booker_%2830362063153%29.jpg/500px-Devin_Booker_%2830362063153%29.jpg",
  },
  {
    file: "anthony-edwards.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Anthony_Edwards_Kentavious_Caldwell-Pope_%2851734745028%29_%28cropped%29.jpg",
  },
  {
    file: "chris-paul.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Chris_Paul_floater_20131118_Clippers_v_Grizzles.jpg/500px-Chris_Paul_floater_20131118_Clippers_v_Grizzles.jpg",
  },
  {
    file: "trae-young.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/0/07/NBA_2021_-_Wizards_vs._Hawks%2C_Oct_29_2021_101_%2851637738135%29_%28cropped%29.jpg",
  },
  {
    file: "ja-morant.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Ja_Morant_%2851665800185%29.jpg/500px-Ja_Morant_%2851665800185%29.jpg",
  },
  {
    file: "jaylen-brown.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Celtics_at_Wizards_2024-12-035.jpg/500px-Celtics_at_Wizards_2024-12-035.jpg",
  },
  {
    file: "dejounte-murray.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Dejonte_Murray_%2851916456198%29.jpg/500px-Dejonte_Murray_%2851916456198%29.jpg",
  },
  {
    file: "paul-george.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Anthony_Tolliver_defending_Paul_George.jpg/500px-Anthony_Tolliver_defending_Paul_George.jpg",
  },
  {
    file: "brandon-ingram.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Brandon_Ingram_2020.jpg/500px-Brandon_Ingram_2020.jpg",
  },
  {
    file: "pascal-siakam.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/1_pascal_siakam_2019_nba_finals.jpg/500px-1_pascal_siakam_2019_nba_finals.jpg",
  },
  {
    file: "julius-randle.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Julius_Randle_with_Lakers.jpg/500px-Julius_Randle_with_Lakers.jpg",
  },
  {
    file: "bam-adebayo.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Adebayo_Hachimura_%28cropped%29.jpg/500px-Adebayo_Hachimura_%28cropped%29.jpg",
  },
  {
    file: "domantas-sabonis.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Domantas_Sabonis_%2832768447291%29.jpg/500px-Domantas_Sabonis_%2832768447291%29.jpg",
  },
  {
    file: "karl-anthony-towns.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Towns-Gibson-20190120.jpg/500px-Towns-Gibson-20190120.jpg",
  },
];

async function fetchWithRetry(url: string, retries = 4): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "nba-teams-card-game (image resize script)" } });
    if (res.ok) return res;
    if (res.status === 429 && attempt < retries) {
      const waitMs = 5000 * (attempt + 1);
      console.log(`429 받음, ${waitMs}ms 대기 후 재시도: ${url}`);
      await sleep(waitMs);
      continue;
    }
    return res;
  }
  throw new Error("unreachable");
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const { file, url } of IMAGES) {
    if (existsSync(path.join(OUT_DIR, file))) {
      console.log(`건너뜀 (이미 존재): ${file}`);
      continue;
    }

    const res = await fetchWithRetry(url);
    if (!res.ok) {
      console.error(`실패 (${res.status}): ${url}`);
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const resized = await sharp(buffer).resize({ width: 500, withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
    await writeFile(path.join(OUT_DIR, file), resized);
    console.log(`저장됨: ${file} (${(resized.length / 1024).toFixed(0)} KB, 원본 ${(buffer.length / 1024).toFixed(0)} KB)`);

    await sleep(1500);
  }

  console.log("완료.");
}

main().catch((err) => {
  console.error("이미지 다운로드 실패:", err);
  process.exit(1);
});
