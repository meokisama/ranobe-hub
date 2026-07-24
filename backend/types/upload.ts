// Multer upload.fields() → req.files là map field → mảng file
export type UploadedFiles = { [fieldname: string]: Express.Multer.File[] } | undefined;

// Tham chiếu file cũ cần xóa (chỉ xóa SAU khi update DB thành công)
export interface OldFileRef {
  filename: string;
  type: string;
  def: string | null;
}
