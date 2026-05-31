import { db } from '@/lib/db';
import { ProfileClient } from './client';

export default async function ProfilePage() {
  let profile = await db.profile.findFirst();
  if (!profile) {
    profile = await db.profile.create({
      data: {
        name: 'Auxance Jourdan',
        handle: 'Auxance',
        emailPublic: 'jauxance@gmail.com',
        abstractEn: '',
        abstractFr: '',
        contactBlurbEn: '',
        contactBlurbFr: '',
      },
    });
  }
  return <ProfileClient profile={profile} />;
}
