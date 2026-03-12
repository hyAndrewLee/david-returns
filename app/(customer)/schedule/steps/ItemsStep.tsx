"use client"

import { Plus, X, Check, ArrowLeft, Camera, Upload } from "lucide-react"
import { useSchedule } from "@/app/(customer)/schedule/ScheduleContext"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog"

export const ItemsStep = () => {
  const {
    formData,
    newItem,
    setNewItem,
    editingItemId,
    showItemModal,
    modalStep,
    setModalStep,
    editItem,
    addItem,
    removeItem,
    handleOpenAddItemModal,
    handleItemModalOpenChange,
    setError,
    validateFileSize,
  } = useSchedule()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">What are you returning?</h1>
        <p className="mt-2 text-muted-foreground">Add each item you'd like us to pick up.</p>
      </div>

      {formData.items.length > 0 && (
        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div
              key={item.id}
              onClick={() => editItem(item)}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground font-semibold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.labelType === "has-label" && "Has printed label"}
                    {item.labelType === "email-pdf" && "Email/PDF label"}
                    {item.labelType === "amazon-qr" && "Amazon QR code"}
                    {item.labelType === "no-label" && "Need us to get label"}
                    {item.retailer && ` • ${item.retailer}`}
                    {item.needsBox === false && " (No box needed)"}
                    {item.returnTo && ` • Drop off: ${item.returnTo}`}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeItem(item.id)
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleOpenAddItemModal}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-8 text-muted-foreground hover:border-foreground hover:text-foreground transition-all"
      >
        <Plus className="h-5 w-5" />
        <span>Add item</span>
      </button>

      <Dialog open={showItemModal} onOpenChange={handleItemModalOpenChange}>
        <DialogContent className="sm:max-w-lg p-6">
          <DialogTitle className="sr-only">Add Return Item</DialogTitle>
          <div className="flex items-center gap-3">
            {(modalStep === "has-label-details" ||
              modalStep === "email-pdf-details" ||
              modalStep === "amazon-qr-details" ||
              modalStep === "no-label-details") && (
              <button
                onClick={() => {
                  setModalStep("select-type")
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-foreground">
              {modalStep === "select-type"
                ? "What type of return label do you have?"
                : newItem.labelType === "has-label"
                  ? "✓ Great! Make sure your printed label is attached to your package."
                  : newItem.labelType === "email-pdf"
                    ? "Upload your digital return label."
                    : newItem.labelType === "amazon-qr"
                      ? "Upload your QR code."
                      : "We'll help you get a return label."}
            </h2>
          </div>

          {modalStep === "select-type" && (
            <SelectTypeStep setNewItem={setNewItem} setModalStep={setModalStep} />
          )}

          {modalStep === "has-label-details" && (
            <HasLabelDetails newItem={newItem} setNewItem={setNewItem} />
          )}

          {modalStep === "email-pdf-details" && (
            <EmailPdfDetails
              newItem={newItem}
              setNewItem={setNewItem}
              validateFileSize={validateFileSize}
              setError={setError}
            />
          )}

          {modalStep === "no-label-details" && (
            <NoLabelDetails newItem={newItem} setNewItem={setNewItem} />
          )}

          {modalStep === "amazon-qr-details" && (
            <AmazonQrDetails
              newItem={newItem}
              setNewItem={setNewItem}
              validateFileSize={validateFileSize}
              setError={setError}
            />
          )}

          {modalStep !== "select-type" && (
            <div className="pt-4 flex gap-3 mt-4 border-t border-border">
              <button
                onClick={() => setModalStep("select-type")}
                className="flex items-center justify-center gap-2 flex-1 rounded-full border border-border py-3 text-sm font-medium text-foreground hover:bg-secondary transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={addItem}
                disabled={
                  !newItem.description.trim() ||
                  (modalStep !== "amazon-qr-details" && !newItem.returnTo) ||
                  (modalStep !== "amazon-qr-details" &&
                    newItem.returnTo === "Other" &&
                    !newItem.returnToOther.trim()) ||
                  !newItem.packageSize ||
                  (newItem.labelType === "email-pdf" && !newItem.file) ||
                  (newItem.labelType === "amazon-qr" && (!newItem.file || !newItem.retailer)) ||
                  (newItem.labelType === "no-label" &&
                    newItem.needHelpGettingLabel &&
                    !newItem.file &&
                    !newItem.returnPortalLink)
                }
                className="flex-1 rounded-full bg-foreground py-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {editingItemId ? "Update Item" : "Add item"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// --- Internal sub-components for modal steps ---

type SelectTypeStepProps = {
  setNewItem: React.Dispatch<React.SetStateAction<import("@/app/(customer)/schedule/ScheduleContext").NewItemState>>
  setModalStep: React.Dispatch<React.SetStateAction<import("@/app/(customer)/schedule/ScheduleContext").ModalStep>>
}

const SelectTypeStep = ({ setNewItem, setModalStep }: SelectTypeStepProps) => (
  <div className="mt-4">
    <p className="text-sm text-muted-foreground mb-4">Choose the option that matches your return method.</p>

    <div className="grid grid-cols-3 gap-3">
      <button
        onClick={() => {
          setNewItem((prev) => ({ ...prev, labelType: "has-label" }))
          setModalStep("has-label-details")
        }}
        className="flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 text-center hover:border-foreground hover:shadow-md transition-all aspect-square"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-600">
            <path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2z" />
            <path d="M7 7h10M7 12h10M7 17h6" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">Physical label</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Already attached</p>
        </div>
      </button>

      <button
        onClick={() => {
          setNewItem((prev) => ({ ...prev, labelType: "email-pdf" }))
          setModalStep("email-pdf-details")
        }}
        className="flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 text-center hover:border-foreground hover:shadow-md transition-all aspect-square"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">Digital label</h3>
          <p className="text-xs text-muted-foreground mt-0.5">PDF, email, or screenshot</p>
        </div>
      </button>

      <button
        onClick={() => {
          setNewItem((prev) => ({ ...prev, labelType: "amazon-qr" }))
          setModalStep("amazon-qr-details")
        }}
        className="flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 text-center hover:border-foreground hover:shadow-md transition-all aspect-square"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="3" height="3" rx="0.5" />
            <rect x="18" y="14" width="3" height="3" rx="0.5" />
            <rect x="14" y="18" width="3" height="3" rx="0.5" />
            <rect x="18" y="18" width="3" height="3" rx="0.5" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">QR code</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Amazon, Kohl's, etc.</p>
        </div>
      </button>
    </div>
  </div>
)

type ItemDetailProps = {
  newItem: import("@/app/(customer)/schedule/ScheduleContext").NewItemState
  setNewItem: React.Dispatch<React.SetStateAction<import("@/app/(customer)/schedule/ScheduleContext").NewItemState>>
}

type ItemDetailWithFileProps = ItemDetailProps & {
  validateFileSize: (file: File) => string | null
  setError: React.Dispatch<React.SetStateAction<string>>
}

const DropOffSelect = ({ newItem, setNewItem }: ItemDetailProps) => (
  <div>
    <label className="text-sm font-medium text-foreground">
      Where should we drop it off? <span className="text-red-500">*</span>
    </label>
    <select
      value={newItem.returnTo}
      onChange={(e) =>
        setNewItem((prev) => ({
          ...prev,
          returnTo: e.target.value,
          returnToOther: e.target.value !== "Other" ? "" : prev.returnToOther,
        }))
      }
      className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
    >
      <option value="">Select drop-off location</option>
      <option value="UPS">UPS</option>
      <option value="FedEx">FedEx</option>
      <option value="USPS">USPS</option>
      <option value="Amazon Locker">Amazon Locker</option>
      <option value="Other">Other</option>
    </select>
    {newItem.returnTo === "Other" && (
      <input
        type="text"
        value={newItem.returnToOther}
        onChange={(e) => setNewItem((prev) => ({ ...prev, returnToOther: e.target.value }))}
        placeholder="Enter drop-off location"
        className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
      />
    )}
  </div>
)

const PackageSizeSelect = ({ newItem, setNewItem }: ItemDetailProps) => (
  <div>
    <label className="text-sm font-medium text-foreground">
      Package size <span className="text-red-500">*</span>
    </label>
    <div className="mt-2 grid grid-cols-3 gap-3">
      {(["small", "medium", "large"] as const).map((size) => (
        <button
          key={size}
          type="button"
          onClick={() => setNewItem((prev) => ({ ...prev, packageSize: size }))}
          className={`rounded-xl border-2 p-3 text-center transition-all ${
            newItem.packageSize === size
              ? "border-foreground bg-foreground/5"
              : "border-border hover:border-foreground/50"
          }`}
        >
          <span className="text-sm font-medium capitalize">{size}</span>
          {size === "small" && <p className="text-xs text-muted-foreground mt-0.5">Shoebox or smaller</p>}
          {size === "medium" && <p className="text-xs text-muted-foreground mt-0.5">Standard box</p>}
          {size === "large" && <p className="text-xs text-muted-foreground mt-0.5">Large box</p>}
        </button>
      ))}
    </div>
  </div>
)

const NotesField = ({ newItem, setNewItem, placeholder }: ItemDetailProps & { placeholder: string }) => (
  <div>
    <label className="text-sm font-medium text-foreground">
      Additional notes <span className="text-muted-foreground">(optional)</span>
    </label>
    <p className="text-xs text-muted-foreground mt-1 mb-2">
      Order number, return code, account number, or special instructions
    </p>
    <textarea
      value={newItem.notes}
      onChange={(e) => setNewItem((prev) => ({ ...prev, notes: e.target.value }))}
      placeholder={placeholder}
      rows={3}
      className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all resize-none"
    />
  </div>
)

const HasLabelDetails = ({ newItem, setNewItem }: ItemDetailProps) => (
  <div className="mt-6 space-y-5 max-h-[60vh] overflow-y-auto pr-2">
    <div className="rounded-xl bg-green-50 border-2 border-green-500 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-green-900 mb-1">Important: Have your printed label ready</p>
          <p className="text-sm text-green-800">
            Our courier will pick up your package and drop it off using the label you've attached.
          </p>
        </div>
      </div>
    </div>

    <div>
      <label className="text-sm font-medium text-foreground">
        What are you returning? <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={newItem.description}
        onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
        placeholder="e.g. Blue sneakers, size 10"
        className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
        autoFocus
      />
    </div>

    <DropOffSelect newItem={newItem} setNewItem={setNewItem} />
    <PackageSizeSelect newItem={newItem} setNewItem={setNewItem} />
    <NotesField newItem={newItem} setNewItem={setNewItem} placeholder="e.g., Order #12345, Handle with care, Amazon account: john@email.com" />

    <div>
      <label className="text-sm font-medium text-foreground">
        Upload photo of package <span className="text-muted-foreground">(optional)</span>
      </label>
      <p className="text-xs text-muted-foreground mt-0.5 mb-2">Recommended so we can identify your package</p>
      <div className="relative">
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.heic,.heif,image/heic,image/heif"
          onChange={(e) => {
            const file = e.target.files?.[0] || null
            setNewItem((prev) => ({ ...prev, photoFile: file }))
          }}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-border bg-secondary/30 px-4 py-4 text-sm text-muted-foreground hover:border-foreground hover:bg-secondary/50 cursor-pointer transition-all"
        >
          {newItem.photoFile ? (
            <div className="flex items-center gap-2 text-foreground w-full justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="font-medium">{newItem.photoFile.name}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setNewItem((prev) => ({ ...prev, photoFile: null }))
                  const input = document.getElementById("photo-upload") as HTMLInputElement
                  if (input) input.value = ""
                }}
                className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                aria-label="Remove photo"
              >
                <X className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ) : (
            <>
              <Camera className="h-5 w-5" />
              <span>Click to upload photo</span>
            </>
          )}
        </label>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="needsBox"
        checked={!newItem.needsBox}
        onChange={(e) => setNewItem((prev) => ({ ...prev, needsBox: !e.target.checked }))}
        className="h-4 w-4 rounded border-border text-orange-500 focus:ring-orange-500"
      />
      <label htmlFor="needsBox" className="text-sm font-medium text-foreground flex items-center gap-2">
        I have my own box
      </label>
    </div>
  </div>
)

const EmailPdfDetails = ({ newItem, setNewItem, validateFileSize, setError }: ItemDetailWithFileProps) => (
  <div className="mt-6 space-y-5 max-h-[60vh] overflow-y-auto pr-2">
    <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
      <p className="text-sm text-blue-800">
        <span className="font-medium">We'll print your label</span> and attach it securely to your package.
      </p>
    </div>

    <div>
      <label className="text-sm font-medium text-foreground">
        Upload your label <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-muted-foreground mt-0.5 mb-2">PNG, JPG, PDF, or iPhone photos • Max 5MB</p>
      <div className="relative">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.heic,.heif,image/heic,image/heif"
          onChange={(e) => {
            const file = e.target.files?.[0] || null
            if (file) {
              const error = validateFileSize(file)
              if (error) {
                setError(error)
                e.target.value = ""
                return
              }
            }
            setNewItem((prev) => ({ ...prev, file }))
          }}
          className="hidden"
          id="label-upload-digital"
        />
        <label
          htmlFor="label-upload-digital"
          className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-border bg-secondary/30 px-4 py-6 text-sm text-muted-foreground hover:border-foreground hover:bg-secondary/50 cursor-pointer transition-all"
        >
          {newItem.file ? (
            <div className="flex items-center gap-2 text-foreground w-full justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="font-medium">{newItem.file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(newItem.file.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setNewItem((prev) => ({ ...prev, file: null }))
                  const input = document.getElementById("label-upload-digital") as HTMLInputElement
                  if (input) input.value = ""
                }}
                className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                aria-label="Remove label file"
              >
                <X className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span>Click to upload label file</span>
            </>
          )}
        </label>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Tip: If your PDF is too large, take a screenshot instead
      </p>
    </div>

    <div>
      <label className="text-sm font-medium text-foreground">
        What are you returning? <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={newItem.description}
        onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
        placeholder="e.g. Blue sneakers, size 10"
        className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
      />
    </div>

    <DropOffSelect newItem={newItem} setNewItem={setNewItem} />

    <div>
      <label className="text-sm font-medium text-foreground">
        Package size <span className="text-red-500">*</span>
      </label>
      <div className="mt-2 grid grid-cols-3 gap-3">
        {(["small", "medium", "large"] as const).map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setNewItem((prev) => ({ ...prev, packageSize: size }))}
            className={`rounded-xl border-2 p-3 text-center transition-all ${
              newItem.packageSize === size
                ? "border-foreground bg-foreground/5"
                : "border-border hover:border-foreground/50"
            }`}
          >
            <span className="text-sm font-medium capitalize">{size}</span>
          </button>
        ))}
      </div>
    </div>

    <NotesField newItem={newItem} setNewItem={setNewItem} placeholder="e.g., Order #12345, Handle with care, Amazon account: john@email.com" />
  </div>
)

const NoLabelDetails = ({ newItem, setNewItem }: ItemDetailProps) => (
  <div className="mt-6 space-y-5 max-h-[60vh] overflow-y-auto pr-2">
    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
      <p className="text-sm text-amber-800">
        <span className="font-medium">If you're missing a label,</span> we can help generate one so your
        return can be completed.
      </p>
    </div>

    <div>
      <label className="text-sm font-medium text-foreground">
        Retailer name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={newItem.retailer}
        onChange={(e) => setNewItem((prev) => ({ ...prev, retailer: e.target.value }))}
        placeholder="e.g. Nike, Zara, Nordstrom"
        className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
        autoFocus
      />
    </div>

    <div>
      <label className="text-sm font-medium text-foreground">
        Order number <span className="text-muted-foreground">(optional)</span>
      </label>
      <input
        type="text"
        value={newItem.orderNumber}
        onChange={(e) => setNewItem((prev) => ({ ...prev, orderNumber: e.target.value }))}
        placeholder="e.g. ORD-123456"
        className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
      />
    </div>

    <div>
      <label className="text-sm font-medium text-foreground">
        Upload proof of purchase <span className="text-muted-foreground">(optional)</span>
      </label>
      <p className="text-xs text-muted-foreground mt-0.5 mb-2">Receipt, order confirmation, or packing slip</p>
      <div className="relative">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.heic,.heif,image/heic,image/heif"
          onChange={(e) => {
            const file = e.target.files?.[0] || null
            setNewItem((prev) => ({ ...prev, file }))
          }}
          className="hidden"
          id="proof-upload"
        />
        <label
          htmlFor="proof-upload"
          className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-border bg-secondary/30 px-4 py-4 text-sm text-muted-foreground hover:border-foreground hover:bg-secondary/50 cursor-pointer transition-all"
        >
          {newItem.file ? (
            <div className="flex items-center gap-2 text-foreground w-full justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="font-medium">{newItem.file.name}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setNewItem((prev) => ({ ...prev, file: null }))
                  const input = document.getElementById("proof-upload") as HTMLInputElement
                  if (input) input.value = ""
                }}
                className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                aria-label="Remove proof file"
              >
                <X className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span>Click to upload file</span>
            </>
          )}
        </label>
      </div>
    </div>

    <div>
      <label className="text-sm font-medium text-foreground">
        Return portal link <span className="text-muted-foreground">(optional)</span>
      </label>
      <input
        type="url"
        value={newItem.returnPortalLink}
        onChange={(e) => setNewItem((prev) => ({ ...prev, returnPortalLink: e.target.value }))}
        placeholder="https://returns.retailer.com/..."
        className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
      />
    </div>

    <div>
      <label className="text-sm font-medium text-foreground">
        Do you want us to request a return label for you?
      </label>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setNewItem((prev) => ({ ...prev, needHelpGettingLabel: true }))}
          className={`rounded-xl border-2 p-3 text-center transition-all ${
            newItem.needHelpGettingLabel
              ? "border-foreground bg-foreground/5"
              : "border-border hover:border-foreground/50"
          }`}
        >
          <span className="text-sm font-medium">Yes, please help</span>
        </button>
        <button
          type="button"
          onClick={() => setNewItem((prev) => ({ ...prev, needHelpGettingLabel: false }))}
          className={`rounded-xl border-2 p-3 text-center transition-all ${
            !newItem.needHelpGettingLabel
              ? "border-foreground bg-foreground/5"
              : "border-border hover:border-foreground/50"
          }`}
        >
          <span className="text-sm font-medium">No, I'll get it</span>
        </button>
      </div>
    </div>

    <div>
      <label className="text-sm font-medium text-foreground">
        What are you returning? <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={newItem.description}
        onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
        placeholder="e.g. Blue sneakers, size 10"
        className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
      />
    </div>

    <PackageSizeSelect newItem={newItem} setNewItem={setNewItem} />

    <div>
      <label className="text-sm font-medium text-foreground">
        Additional notes <span className="text-muted-foreground">(optional)</span>
      </label>
      <p className="text-xs text-muted-foreground mt-1 mb-2">
        Order number, account number, return reason, or any info we need to get your label
      </p>
      <textarea
        value={newItem.notes}
        onChange={(e) => setNewItem((prev) => ({ ...prev, notes: e.target.value }))}
        placeholder="e.g., Order #12345, Reason: Wrong size, Customer ID: ABC123"
        rows={3}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all resize-none"
      />
    </div>
  </div>
)

const AmazonQrDetails = ({ newItem, setNewItem, validateFileSize, setError }: ItemDetailWithFileProps) => (
  <div className="mt-6 space-y-5 max-h-[60vh] overflow-y-auto pr-2">
    <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
      <p className="text-sm text-blue-800">
        <span className="font-medium">Scan and go!</span> We'll help you get your QR code ready for the carrier.
      </p>
    </div>

    <div>
      <label className="text-sm font-medium text-foreground">
        Retailer <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={newItem.retailer}
        onChange={(e) => setNewItem((prev) => ({ ...prev, retailer: e.target.value }))}
        placeholder="e.g. Amazon, Zappos, Nordstrom"
        className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
        autoFocus
      />
    </div>

    <div>
      <label className="text-sm font-medium text-foreground">
        Upload your QR code <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-muted-foreground mt-0.5 mb-2">PNG, JPG, PDF, or iPhone photos • Max 5MB</p>
      <div className="relative">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.heic,.heif,image/heic,image/heif"
          onChange={(e) => {
            const file = e.target.files?.[0] || null
            if (file) {
              const error = validateFileSize(file)
              if (error) {
                setError(error)
                e.target.value = ""
                return
              }
            }
            setNewItem((prev) => ({ ...prev, file }))
          }}
          className="hidden"
          id="qr-code-upload"
        />
        <label
          htmlFor="qr-code-upload"
          className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-border bg-secondary/30 px-4 py-6 text-sm text-muted-foreground hover:border-foreground hover:bg-secondary/50 cursor-pointer transition-all"
        >
          {newItem.file ? (
            <div className="flex items-center gap-2 text-foreground w-full justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="font-medium">{newItem.file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(newItem.file.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setNewItem((prev) => ({ ...prev, file: null }))
                  const input = document.getElementById("qr-code-upload") as HTMLInputElement
                  if (input) input.value = ""
                }}
                className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                aria-label="Remove QR code file"
              >
                <X className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span>Click to upload QR code</span>
            </>
          )}
        </label>
      </div>
    </div>

    <div>
      <label className="text-sm font-medium text-foreground">
        What are you returning? <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={newItem.description}
        onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
        placeholder="e.g. T-shirt, size M"
        className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
      />
    </div>

    <div>
      <label className="text-sm font-medium text-foreground">
        Package size <span className="text-red-500">*</span>
      </label>
      <div className="mt-2 grid grid-cols-3 gap-3">
        {(["small", "medium", "large"] as const).map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setNewItem((prev) => ({ ...prev, packageSize: size }))}
            className={`rounded-xl border-2 p-3 text-center transition-all ${
              newItem.packageSize === size
                ? "border-foreground bg-foreground/5"
                : "border-border hover:border-foreground/50"
            }`}
          >
            <span className="text-sm font-medium capitalize">{size}</span>
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="text-sm font-medium text-foreground">
        Additional notes <span className="text-muted-foreground">(optional)</span>
      </label>
      <p className="text-xs text-muted-foreground mt-1 mb-2">
        Order number, account number, or any info we need to process your return
      </p>
      <textarea
        value={newItem.notes}
        onChange={(e) => setNewItem((prev) => ({ ...prev, notes: e.target.value }))}
        placeholder="e.g., Order #12345, Customer ID: ABC123"
        rows={3}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all resize-none"
      />
    </div>
  </div>
)
