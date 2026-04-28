import FormAccessClient from "./FormAccessClient";

export async function generateStaticParams() {
  return [];
}

export default async function Page({ params }) {
  const { token } = await params;
  return <FormAccessClient token={token} />;
}
// import FormAccessClient from "./FormAccessClient";

// export async function generateStaticParams() {
//   return [];
// }

// export default function Page({ params }) {
//   return <FormAccessClient token={params.token} />;
// }