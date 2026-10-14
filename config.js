/* Public settings shipped with the app. The publishable key is meant to be public (row-level security
   protects the data); never put the secret/service key here. */
window.XRAY_CONFIG = {
  supabaseUrl: "https://cpkdtgrgqrlgnooftcci.supabase.co",
  supabaseKey: "sb_publishable_yuiduOtKET87bxXX2DFtSw_I2CyUgwg",  // publishable key
  get dataUrl() { return this.supabaseUrl ? `${this.supabaseUrl}/storage/v1/object/public/app` : (this.localData || ""); },
  localData: "",                                  // local testing only: a folder with index.json and c/*.json
  termsUrl: "https://x-ray.live/terms/",          // public Terms of Service
  privacyUrl: "https://x-ray.live/privacy/",      // public Privacy Policy
  deleteUrl: "https://x-ray.live/delete/",        // public account-deletion page (Google Play requires one)
};
