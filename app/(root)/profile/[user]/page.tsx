import ProfileDisplay from "@/components/ProfileDisplay";
import { getUserByEmail } from "@/lib/actions/user.actions";

export default async function Profile({
  params,
}: {
  params: { user: string };
}) {
  const user = await getUserByEmail({ accountId: params.user });
  return <ProfileDisplay user={user} />;
}
