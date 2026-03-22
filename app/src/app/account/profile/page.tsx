import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm, ChangePasswordForm } from "@/components/account/profile-form";

export default async function ProfilePage() {
  const auth = await getAuthUser();
  if (!auth) return null;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { name: true, email: true, phone: true, payerCpf: true },
  });

  return (
    <div className="space-y-8">
      <ProfileForm
        initialProfile={
          user
            ? {
                name: user.name,
                email: user.email,
                phone: user.phone,
                payerCpf: user.payerCpf,
              }
            : null
        }
      />
      <ChangePasswordForm />
    </div>
  );
}
