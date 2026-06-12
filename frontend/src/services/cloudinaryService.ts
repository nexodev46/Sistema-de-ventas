const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dkc6jalzn'
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'kaita_products'

export const cloudinaryService = {
  uploadImage: async (file: File): Promise<string> => {
    console.log('Subiendo a Cloudinary...', file.name, { cloudName: CLOUD_NAME, uploadPreset: UPLOAD_PRESET })
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      const errorMessage = data?.error?.message || JSON.stringify(data) || response.statusText
      throw new Error(`Cloudinary upload failed: ${response.status} ${errorMessage}`)
    }

    console.log('Cloudinary response:', data)
    if (!data || !data.secure_url) {
      throw new Error(`Cloudinary upload succeeded but no secure_url returned: ${JSON.stringify(data)}`)
    }

    return data.secure_url
  },

  uploadMultipleImages: async (files: File[]): Promise<string[]> => {
    const urls: string[] = []
    for (const file of files) {
      const url = await cloudinaryService.uploadImage(file)
      urls.push(url)
    }
    return urls
  }
}
