import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, ChevronRight, User, Phone, CreditCard, IdCard  } from "lucide-react";

export default function KYCPage() {
  const { user, profile } = useAuth(); // Note: refreshProfile is removed
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [idNumber, setIdNumber] = useState(profile?.id_number || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!fullName.trim() || !phone.trim() || !idNumber.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);

    let avatarUrl: string | null = null;
    if (avatar) {
      // Create a unique filename
      const fileExt = avatar.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatar, { upsert: true });

      if (uploadError) {
        toast.error("Failed to upload avatar: " + uploadError.message);
        setLoading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      avatarUrl = urlData.publicUrl;
    }

    // Update profile
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim(),
        id_number: idNumber.trim(),
        kyc_status: "pending",
        ...(avatarUrl && { avatar_url: avatarUrl }), // Only update if avatar was uploaded
      })
      .eq("id", user.id);

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("KYC submitted! Awaiting admin approval.");

      // Wait a moment for the database to update
      setTimeout(() => {
        navigate("/kyc-pending");
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4"
      style={{
        backgroundImage: 'url("/hero-bg.jpg")',
        backgroundSize: 'cover', // Ensures the image covers the entire area
        backgroundPosition: 'center', // Centers the image
        backgroundRepeat: 'no-repeat', // Prevents tiling
      }}
    >
      <Card className="w-full max-w-2xl min-h-[750px] flex flex-col justify-center animate-fade-in bg-slate-800/40 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="text-center py-12">
          <CardTitle className="text-2xl font-bold tracking-tight">Identity Verification</CardTitle>
          <CardDescription className="text-slate-400 text-lg mt-2">
            {profile?.kyc_status === "rejected"
              ? "Your previous submission was rejected. Please update your information."
              : "Complete your KYC to start using GigHold"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-12 pb-16">
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
            <Label htmlFor="fullName" className="text-slate-200 font-medium text-lg flex items-center gap-2">
              <User size={20} className="text-slate-400" /> Full Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="John Doe"
              maxLength={100}
              className="h-14 rounded-xl text-lg bg-slate-600/20 border-slate-400 text-white placeholder:text-slate-500 focus:ring-yellow-500 py-6"
            />
          </div>

            <div className="space-y-3">
            <Label htmlFor="phone" className="text-slate-200 font-medium text-lg flex items-center gap-2">
              <Phone size={20} className="text-slate-400" /> Phone Number
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+27 81 234 5678"
              maxLength={20}
              className="h-14 rounded-xl text-lg bg-slate-600/20 border-slate-400 text-white placeholder:text-slate-500 focus:ring-yellow-500 py-6"
            />
          </div>

            <div className="space-y-3">
            <Label htmlFor="idNumber" className="text-slate-200 font-medium text-lg flex items-center gap-2">
              <IdCard size={20} className="text-slate-400" /> Government ID Number
            </Label>
            <Input
              id="idNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
              placeholder="ID number"
              maxLength={20}
              className="h-14 rounded-xl text-lg bg-slate-600/20 border-slate-400 text-white placeholder:text-slate-500 focus:ring-yellow-500 py-6"
            />
          </div>

            <div className="space-y-3">
              <Label htmlFor="avatar" className="text-slate-200 font-medium text-lg">Profile Picture (Optional)</Label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="avatar-upload"
                  className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer text-base font-bold transition-all duration-300 ease-in-out border"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  }}
                  // Adding the hover effect via inline styles or tailwind classes
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <Upload className="h-4 w-4" />
                  {avatar ? avatar.name : "Choose file"}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                />
              </div>
              {avatar && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {avatar.name}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full font-bold py-7 rounded-full border border-white/20 shadow-lg transition-all hover:opacity-90 active:scale-[0.99] text-lg mt-4 text-white"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)'
              }}
              disabled={loading}
            >
              {loading && <Loader2 className="h-6 w-6 animate-spin mr-3" />}
              {loading ? "Submitting..." : "Submit Verification"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}