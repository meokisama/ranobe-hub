// Multer upload.fields() → req.files is a map of field → file array
export type UploadedFiles = { [fieldname: string]: Express.Multer.File[] } | undefined;

// Reference to an old file to delete (only AFTER the DB update succeeds)
export interface OldFileRef {
  filename: string;
  type: string;
  def: string | null;
}
