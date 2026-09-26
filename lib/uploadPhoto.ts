import { supabase } from '@/lib/supabase';

/**
 * Compresse une image (max 800x800, JPEG 85%) pour un transfert ultra-rapide et optimisé.
 */
function compressImage(file: File, maxDim = 800, quality = 0.85): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Erreur initialisation canvas'));
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl });
            } else {
              reject(new Error('Erreur conversion image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Fichier image invalide ou illisible'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsDataURL(file);
  });
}

/**
 * Téléverse de manière sécurisée une photo d'employé depuis un PC ou un smartphone.
 * 1. Compresse l'image pour un chargement instantané.
 * 2. Tente l'envoi vers le bucket Supabase Storage 'photos' et retourne l'URL publique officielle.
 * 3. Si le bucket n'est pas encore configuré dans Supabase, retourne le Data URI compressé
 *    pour ne jamais bloquer l'utilisateur.
 */
export async function uploadEmployeePhoto(file: File, employeeId: string): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
  }

  // Compression initiale
  const { blob, dataUrl } = await compressImage(file, 800, 0.85);

  // Envoi vers le bucket Supabase Storage 'photos'
  try {
    const cleanId = (employeeId || 'collab').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fileName = `${cleanId}_${Date.now()}.jpg`;
    const filePath = `employees/${fileName}`;

    const { data, error } = await supabase.storage.from('photos').upload(filePath, blob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: true
    });

    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
      if (publicUrl) {
        return publicUrl;
      }
    }
    if (error) {
      console.warn('Supabase storage upload notice (utilisation repli dataUrl):', error.message);
    }
  } catch (err) {
    console.warn('Supabase storage direct upload catch:', err);
  }

  // Repli automatique si le bucket Storage n'est pas encore créé
  return dataUrl;
}
