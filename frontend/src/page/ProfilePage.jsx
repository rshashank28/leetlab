import { useAuthStore } from "../store/useAuthStore";
import { User, Mail, Shield, Calendar } from "lucide-react";

const ProfilePage = () => {
  const { authUser } = useAuthStore();

  if (!authUser) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-base-200 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-4">
            {authUser.image ? (
              <img src={authUser.image} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold">{authUser.name || "User"}</h2>
          <span className={`badge mt-2 ${authUser.role === "ADMIN" ? "badge-error" : "badge-primary"}`}>
            {authUser.role}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-base-300 rounded-xl">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium">{authUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-base-300 rounded-xl">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-gray-500">Role</p>
              <p className="font-medium">{authUser.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-base-300 rounded-xl">
            <User className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-gray-500">User ID</p>
              <p className="font-medium text-sm">{authUser.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
