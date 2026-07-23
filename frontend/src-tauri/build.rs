fn main() {
    // Ensure a Windows .ico exists so tauri-build can generate resources.
    // If icons/icon.ico is missing but icons/32x32.png exists, create a simple
    // ICO container with the PNG embedded (valid for modern Windows ico files).
    use std::env;
    use std::fs;
    use std::path::Path;

    let manifest_dir = env::var("CARGO_MANIFEST_DIR").unwrap_or_else(|_| ".".into());
    let icons_dir = Path::new(&manifest_dir).join("icons");
    let ico_path = icons_dir.join("icon.ico");
    let png_path = icons_dir.join("32x32.png");

    if png_path.exists() {
        if let Ok(img) = image::open(&png_path) {
            let img = img.to_rgba8();
            let (w, h) = img.dimensions();
            // Build DIB (BITMAPINFOHEADER + pixel data + AND mask)
            let mut dib: Vec<u8> = Vec::new();
            // BITMAPINFOHEADER (40 bytes)
            dib.extend_from_slice(&40u32.to_le_bytes()); // biSize
            dib.extend_from_slice(&(w as i32).to_le_bytes()); // biWidth
            // For ICO BMP, biHeight = height * 2 (image + AND mask)
            dib.extend_from_slice(&((h as i32 * 2).to_le_bytes())); // biHeight
            dib.extend_from_slice(&1i16.to_le_bytes()); // biPlanes
            dib.extend_from_slice(&32i16.to_le_bytes()); // biBitCount
            dib.extend_from_slice(&0u32.to_le_bytes()); // biCompression (BI_RGB)
            dib.extend_from_slice(&0u32.to_le_bytes()); // biSizeImage
            dib.extend_from_slice(&0i32.to_le_bytes()); // biXPelsPerMeter
            dib.extend_from_slice(&0i32.to_le_bytes()); // biYPelsPerMeter
            dib.extend_from_slice(&0u32.to_le_bytes()); // biClrUsed
            dib.extend_from_slice(&0u32.to_le_bytes()); // biClrImportant

            // Pixel data: bottom-up, each pixel BGRA
            for row in (0..h).rev() {
                for col in 0..w {
                    let p = img.get_pixel(col, row).0;
                    // BGRA order
                    dib.push(p[2]);
                    dib.push(p[1]);
                    dib.push(p[0]);
                    dib.push(p[3]);
                }
            }

            // AND mask: 1 bit per pixel, padded to 32-bit rows. We'll write zeros (no transparency mask)
            let row_bits = ((w + 31) / 32) * 32; // padded width in bits
            let bytes_per_row = (row_bits / 8) as usize;
            let mask_row = vec![0u8; bytes_per_row];
            for _ in 0..h {
                dib.extend_from_slice(&mask_row);
            }

            // Now build ICO file: ICONDIR + ICONDIRENTRY + DIB
            let mut ico: Vec<u8> = vec![0, 0, 1, 0, 1, 0];
            // ICONDIRENTRY
            ico.push((w.min(255)) as u8);
            ico.push((h.min(255)) as u8);
            ico.push(0u8); // color count
            ico.push(0u8); // reserved
            ico.extend_from_slice(&1u16.to_le_bytes()); // planes
            ico.extend_from_slice(&32u16.to_le_bytes()); // bit count
            let bytes_in_res = (dib.len() as u32).to_le_bytes();
            ico.extend_from_slice(&bytes_in_res);
            let image_offset = (6 + 16) as u32;
            ico.extend_from_slice(&image_offset.to_le_bytes());

            ico.extend_from_slice(&dib);

            let _ = fs::create_dir_all(&icons_dir);
            let _ = fs::write(&ico_path, ico);
        }
    }

    // tauri-build generates the needed resources at build time (sets OUT_DIR)
    tauri_build::build()
}
