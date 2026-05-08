import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-heading tracking-[0.2em] uppercase mb-8 border-b border-white/10 pb-4">Settings</h1>
      
      <div className="space-y-12">
        {/* Profile Settings */}
        <section>
          <h2 className="text-xl font-heading tracking-widest uppercase mb-6 text-[var(--accent)]">Profile</h2>
          <form className="flex flex-col gap-6">
            <div className="flex items-center gap-6 mb-4">
              <div className="w-20 h-20 bg-[#222] rounded-full border border-white/10" />
              <Button variant="ghost" size="sm">Change Avatar</Button>
            </div>
            
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Display Name</label>
              <Input variant="onDark" type="text" defaultValue="John Doe" />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Bio</label>
              <textarea 
                className="w-full bg-transparent border-b border-white text-white p-2 text-sm focus:outline-none placeholder:text-gray-600 resize-none font-sans tracking-[0.04em]"
                rows={3}
                defaultValue="Landscape & Street Photographer based in Seoul. Sony a7IV."
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Gear Summary</label>
              <Input variant="onDark" type="text" defaultValue="Sony a7IV, FE 24-70mm GM" />
            </div>

            <Button variant="primary" className="w-fit mt-4">Save Profile</Button>
          </form>
        </section>

        {/* Account Settings */}
        <section>
          <h2 className="text-xl font-heading tracking-widest uppercase mb-6 text-[var(--accent)] border-t border-white/10 pt-12">Account</h2>
          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-300 mb-1">Email</div>
              <div className="text-gray-500 text-sm">john@example.com</div>
            </div>
            
            <Button variant="ghostDark" className="border-red-500 text-red-500 hover:bg-red-500/10">
              Sign Out
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
