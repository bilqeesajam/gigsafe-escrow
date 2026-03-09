import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const categories = ["errand", "pickup", "delivery", "shopping", "other"] as const;

export default function PostGigPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<string>("other");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    const budgetNum = parseFloat(budget);
    if (!budgetNum || budgetNum <= 0) { toast.error("Enter a valid budget"); return; }
    if ((profile.balance || 0) < budgetNum) { toast.error("Insufficient balance. Top up your wallet first."); return; }
    if (!title.trim() || !description.trim() || !location.trim()) { toast.error("Fill all fields"); return; }

    setLoading(true);

    // Deduct balance (hold)
    const { error: balError } = await supabase.from("profiles").update({
      balance: (profile.balance || 0) - budgetNum,
    }).eq("id", user.id);
    if (balError) { toast.error(balError.message); setLoading(false); return; }

    // Create gig
    const { error: gigError } = await supabase.from("gigs").insert({
      client_id: user.id,
      title: title.trim(),
      description: description.trim(),
      budget: budgetNum,
      location: location.trim(),
      category: category as any,
    });

    if (gigError) {
      // Refund on failure
      await supabase.from("profiles").update({ balance: (profile.balance || 0) }).eq("id", user.id);
      toast.error(gigError.message);
    } else {
      // Record hold transaction
      await supabase.from("transactions").insert({
        from_user_id: user.id,
        amount: budgetNum,
        type: "hold" as const,
      });
      await refreshProfile();
      toast.success("Gig posted successfully!");
      navigate("/my-gigs");
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle>Post a New Gig</CardTitle>
            <CardDescription>Describe the task you need done</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Pick up documents from CBD" maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Describe what needs to be done..." maxLength={1000} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Budget (R)</Label>
                  <Input type="number" min="1" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} required placeholder="50.00" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="e.g. Johannesburg CBD" maxLength={100} />
              </div>
              <p className="text-xs text-muted-foreground">
                Your wallet balance: <span className="font-mono font-semibold">R{(profile?.balance || 0).toFixed(2)}</span>
              </p>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Post Gig
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
