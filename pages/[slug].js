import { loadLinks } from '../lib/storage';

export const getServerSideProps = async ({ params }) => {
  const slug = params?.slug;
  const links = await loadLinks();
  const target = slug ? links[slug] : null;

  if (target) {
    return {
      redirect: {
        destination: target,
        permanent: true,
      },
    };
  }

  return { notFound: true };
};

export default function RedirectPage() {
  return null;
}
