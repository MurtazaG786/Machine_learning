import { useState, useRef, useEffect } from 'react'
import { MdClose, MdCloudUpload, MdCamera, MdCheck } from 'react-icons/md'
import api from '../api/axios'
import toast from 'react-hot-toast'

const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Education', 'Travel', 'Other']

export default function ScanBillModal({ onClose, onAddExpense }) {
  const [step, setStep] = useState('upload')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState({ amount: '', category: 'Other', description: 'Scanned expense' })
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()
  const videoRef = useRef()
  const [cameraOpen, setCameraOpen] = useState(false)
  const [stream, setStream] = useState(null)

  // Stop camera stream and revoke blob URLs on unmount
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [stream])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleFile = (f) => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }

  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setStream(s)
      setCameraOpen(true)
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s }, 100)
    } catch { toast.error('Camera not available') }
  }

  const capturePhoto = () => {
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    canvas.toBlob((blob) => {
      const f = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
      handleFile(f)
      stream?.getTracks().forEach(t => t.stop())
      setCameraOpen(false)
    }, 'image/jpeg')
  }

  const scanBill = async () => {
    if (!file) return toast.error('Please select an image')
    setLoading(true)
    setStep('scanning')
    try {
      const formData = new FormData()
      formData.append('receipt', file)
      const { data } = await api.post('/expenses/upload-receipt', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult({ amount: data.amount || '', category: data.category || 'Other', description: 'Scanned expense' })
      setStep('result')
    } catch (err) {
      toast.error('OCR failed: ' + (err.response?.data?.message || err.message))
      setStep('upload')
    } finally { setLoading(false) }
  }

  const addExpense = async () => {
    if (!result.amount) return toast.error('Please enter an amount')
    try {
      await onAddExpense({ amount: parseFloat(result.amount), category: result.category, description: result.description, paymentMethod: 'Cash' })
      toast.success('Expense added successfully!')
      onClose()
    } catch { toast.error('Failed to add expense') }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="glass w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500" style={{ animation: step === 'scanning' ? 'none' : undefined }}>
          {step === 'scanning' && <div className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 animate-pulse" />}
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">📷 Scan Bill</h2>
              <p className="text-white/50 text-sm">Upload or capture your receipt</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/60 hover:text-white"><MdClose /></button>
          </div>

          {cameraOpen ? (
            <div className="space-y-4">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl" />
              <button onClick={capturePhoto} className="btn-primary w-full py-3 flex items-center justify-center gap-2"><MdCamera className="text-lg" /> Capture</button>
            </div>
          ) : step === 'upload' || (step === 'result' && !loading) ? (
            <div className="space-y-4">
              {!preview ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-purple-400 bg-purple-500/10' : 'border-white/20 hover:border-purple-400/50 hover:bg-white/5'}`}>
                  <MdCloudUpload className="text-4xl text-purple-400 mx-auto mb-3" />
                  <p className="text-white font-medium">Drop your bill here</p>
                  <p className="text-white/40 text-sm mt-1">or click to browse</p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
                </div>
              ) : (
                <div className="relative">
                  <img src={preview} alt="Receipt preview" className="w-full rounded-xl max-h-48 object-cover" />
                  <button onClick={() => { setFile(null); setPreview(null); setStep('upload') }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white text-xs"><MdClose /></button>
                </div>
              )}
              <button onClick={openCamera} className="w-full py-2 border border-white/20 rounded-xl text-white/70 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2 text-sm">
                <MdCamera className="text-lg" /> Use Camera
              </button>

              {step === 'result' && (
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <h3 className="text-white font-semibold flex items-center gap-2"><MdCheck className="text-green-400" /> Extracted Details</h3>
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">Amount</label>
                    <input type="number" value={result.amount} onChange={(e) => setResult(p => ({ ...p, amount: e.target.value }))} className="input-field" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">Category</label>
                    <select value={result.category} onChange={(e) => setResult(p => ({ ...p, category: e.target.value }))} className="input-field bg-dark-800">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">Description</label>
                    <input type="text" value={result.description} onChange={(e) => setResult(p => ({ ...p, description: e.target.value }))} className="input-field" />
                  </div>
                  <button onClick={addExpense} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                    <MdCheck /> Add to Expenses
                  </button>
                </div>
              )}

              {step === 'upload' && preview && (
                <button onClick={scanBill} disabled={loading} className="btn-accent w-full py-3 flex items-center justify-center gap-2">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '🔍'} Scan Bill
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
              </div>
              <p className="text-white font-semibold">Scanning your bill...</p>
              <p className="text-white/40 text-sm">AI is extracting amount &amp; category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
