import axios from "axios";
import { apiUrl } from "@/utils/http";
import Button from "./UI/Button";
import { useRef } from "react";
import { message } from "antd";

const exportWorkouts = async () => {
    const response = await axios.get(apiUrl("/api/export/csv"), {
        responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'workouts.zip')
    document.body.appendChild(link)
    link.click()
    link.remove()
}

const AdminPanelContent = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    const handleImportClick = () => {
        inputRef.current?.click();
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        e.target.value = "";
        if (selected) {
            const formData = new FormData();
            formData.append("file", selected);
            await axios.post(apiUrl("/api/import/csv"), formData);
            message.success("Imported workouts successfully");
        }
    }

    return (
      <>
        <input
            ref={inputRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={handleFileChange}
        />
        <div className="grid gap-4 grid-cols-2">
          <Button
              dark
              onClick={exportWorkouts}
          >
              <span className="text-white w-full">Export</span>
          </Button>

          <Button
              dark
              onClick={handleImportClick}
          >
              <span className="text-white w-full">Import</span>
          </Button>
        </div>
      </>
    )
};

export default AdminPanelContent;