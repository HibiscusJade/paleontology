import { toast } from "sonner";

export interface UploadedFile {
  name: string;
  dataUrl: string;
}

/** 打开文件选择器并读取为 data URL（原型本地存储用） */
export function pickAndReadFile(
  accept: string,
  maxSizeMb: number,
  onSuccess: (file: UploadedFile) => void,
): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`文件大小不能超过 ${maxSizeMb}MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onSuccess({ name: file.name, dataUrl: reader.result as string });
    };
    reader.onerror = () => toast.error("文件读取失败，请重试。");
    reader.readAsDataURL(file);
  };
  input.click();
}
