import type { FooterItem, MainNavItem } from "@/types"

import { productConfig } from "@/config/product"
import { slugify } from "@/lib/utils"

export type SiteConfig = typeof siteConfig

const links = {
  x: "https://github.com/khieu-dv",
  github: "https://github.com/khieu-dv/vieshare",
  githubAccount: "https://github.com/khieu-dv",
  discord: "https://github.com/khieu-dv",
  calDotCom: "https://github.com/khieu-dv",
}

export const siteConfig = {
  name: "VieShare",
  description:
    "An open source e-commerce vieshare build with everything new in Next.js.",
  url: "https://vieshare.com",
  ogImage: "https://vieshare.com/opengraph-image.png",
  links,
  mainNav: [
    {
      title: "Lobby",
      items: [
        {
          title: "Products",
          href: "/products",
          description: "All the products we have to offer.",
          items: [],
        },
        {
          title: "Build a Board",
          href: "/build-a-board",
          description: "Build your own custom vieboard.",
          items: [],
        },
        {
          title: "Blog",
          href: "/blog",
          description: "Read our latest blog posts.",
          items: [],
        },
      ],
    },
    ...productConfig.categories.map((category) => ({
      title: category.name,
      items: [
        {
          title: "All",
          href: `/categories/${slugify(category.name)}`,
          description: `All ${category.name}.`,
          items: [],
        },
        ...category.subcategories.map((subcategory) => ({
          title: subcategory.name,
          href: `/categories/${slugify(category.name)}/${slugify(subcategory.name)}`,
          description: subcategory.description,
          items: [],
        })),
      ],
    })),
  ] satisfies MainNavItem[],
  footerNav: [
    {
      title: "Help",
      items: [
        {
          title: "About",
          href: "/about",
          external: false,
        },
        {
          title: "Contact",
          href: "/contact",
          external: false,
        },
        {
          title: "Terms",
          href: "/terms",
          external: false,
        },
        {
          title: "Privacy",
          href: "/privacy",
          external: false,
        },
      ],
    },
    {
      title: "Social",
      items: [
        {
          title: "X",
          href: links.x,
          external: true,
        },
        {
          title: "GitHub",
          href: links.githubAccount,
          external: true,
        },
        {
          title: "Discord",
          href: links.discord,
          external: true,
        },
        {
          title: "cal.com",
          href: links.calDotCom,
          external: true,
        },
      ],
    }
  ] satisfies FooterItem[],
}
