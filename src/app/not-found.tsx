import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="grid min-h-svh place-items-center px-4 text-center">
      <div>
        <Image src="/images/logo-main.png" alt="JAMZA!" width={994} height={780} className="mx-auto w-40 animate-wobble" />
        <p className="display mt-8 text-7xl text-tomato">Lost in the snow</p>
        <p className="mt-4 text-lavender">This page wandered off before the party started.</p>
        <Link href="/" className="btn btn-cream mt-8">Back to the festival</Link>
      </div>
    </section>
  );
}
