import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

export default function KYCPage() {
  const { user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [selfie, setSelfie] = useState<File | null>(null);
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

    let selfieUrl: string | null = null;
    if (selfie) {
      const ext = selfie.name.split(".").pop();
      const path = `${user.id}/selfie.${ext}`;
      const { error: uploadError } = await supabase.storage.from("kyc-selfies").upload(path, selfie, { upsert: true });
      if (uploadError) {
        toast.error("Failed to upload selfie: " + uploadError.message);
        setLoading(false);
        return;
      }
      selfieUrl = path;
    }

    const { error } = await supabase.from("profiles").update({
      full_name: fullName.trim(),
      phone: phone.trim(),
      id_number: idNumber.trim(),
      kyc_status: "pending",
    }).eq("id", user.id);

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      await refreshProfile();
      toast.success("KYC submitted! Awaiting admin approval.");
      navigate("/kyc-pending");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Identity Verification</CardTitle>
          <CardDescription>Complete your KYC to start using GigHold</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="John Doe" maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+27 81 234 5678" maxLength={20} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNumber">Government ID Number</Label>
              <Input id="idNumber" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required placeholder="ID number" maxLength={20} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="selfie">Selfie (optional)</Label>
              <div className="flex items-center gap-2">
                <label htmlFor="selfie-upload" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent cursor-pointer text-sm">
                  <Upload className="h-4 w-4" />
                  {selfie ? selfie.name : "Choose file"}
                </label>
                <input id="selfie-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setSelfie(e.target.files?.[0] || null)} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Verification
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
