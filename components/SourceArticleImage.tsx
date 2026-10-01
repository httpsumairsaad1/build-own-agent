import Image from "next/image";
import type { Article } from "@/lib/data/mock-articles";
import { ArticleThumbnail } from "./ArticleThumbnail";

interface SourceArticleImageProps {
  article: Pick<Article, "imageUrl" | "imageTheme" | "title">;
  className?: string;
  sizes: string;
}

function isPublicImageUrl(value: string | undefined): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function SourceArticleImage({ article, className = "w-full h-44", sizes }: SourceArticleImageProps) {
  if (!isPublicImageUrl(article.imageUrl)) {
    return <ArticleThumbnail theme={article.imageTheme} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden rounded-lg border border-[#2C2C2C] bg-[#121212] ${className}`}>
      <Image src={article.imageUrl} alt={article.title} fill sizes={sizes} className="object-cover" />
    </div>
  );
}