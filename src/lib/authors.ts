// Article authors with a public profile. An article's free-text `author`
// links to a profile when it starts with one of these names.
export type Author = { name: string; url: string; sameAs: string[] }

const AUTHORS: Author[] = [
  {
    name: 'ครูวุฒิ',
    url: 'https://dogsanook.com/dog-trainer',
    sameAs: [
      'https://www.facebook.com/dogsanook',
      'https://www.instagram.com/dogsanook',
      'https://line.me/R/ti/p/@dogsanook',
      'https://www.youtube.com/@dogsanook',
    ],
  },
  {
    name: 'ครูแคท',
    url: 'https://www.dogsquest.net/',
    sameAs: [
      'https://www.facebook.com/katnichpawqest/',
      'https://www.instagram.com/katnich.dogsquest',
      'https://www.tiktok.com/@katnich.pawsquest',
      'https://youtube.com/@katnichdogsquest',
    ],
  },
]

export function authorProfile(author: string | null | undefined): Author | undefined {
  const name = author?.trim()
  return name ? AUTHORS.find((a) => name.startsWith(a.name)) : undefined
}
