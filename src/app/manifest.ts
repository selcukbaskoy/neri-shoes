import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Neri Shoes',
    short_name: 'Neri Shoes',
    description: 'Premium erkek ayakkabı koleksiyonu — toptan ve perakende',
    start_url: '/tr',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#C9A84C',
    icons: [
      {
        src: '/logo.jpeg',
        sizes: 'any',
        type: 'image/jpeg',
      },
    ],
  };
}
