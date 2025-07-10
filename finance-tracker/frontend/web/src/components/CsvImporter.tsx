import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../utils/hooks";
import { importTransactionsFromCsv } from "../store/slices/transactionSlice";
import { UploadIcon } from "./Icons";

interface CsvImporterProps {
  onSuccess?: () => void;
}

const CsvImporter: React.FC<CsvImporterProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.categories);
  const [file, setFile] = useState<File | null>(null);
  const [defaultCategoryId, setDefaultCategoryId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError("Please select a valid CSV file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a CSV file to upload");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Read file content as text
      const csvData = await file.text();

      // Prepare JSON payload for direct endpoint
      const payload = {
        csvData,
        defaultCategoryId: defaultCategoryId || undefined,
      };

      const result = await dispatch(
        importTransactionsFromCsv(payload)
      ).unwrap();
      setSuccess(`Successfully imported ${result.count} transactions`);
      setFile(null);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to import transactions");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">Import Transactions from CSV</h2>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CSV File
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                CSV file with transactions
              </p>
              {file && (
                <p className="text-sm text-green-600">Selected: {file.name}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="defaultCategory"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Default Category (optional)
          </label>
          <select
            id="defaultCategory"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={defaultCategoryId}
            onChange={(e) => setDefaultCategoryId(e.target.value)}
          >
            <option value="">Select a default category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Used when a category in the CSV file is not found
          </p>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700">
              CSV Format Example:
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Type, Category, Date, Transaction, Note
              <br />
              "Expenses", "Grocery", "2025-03-25T00:00:00.000Z", "-30,50",
              "#fruttivendolo"
              <br />
              "Income", "Salary", "2025-03-17T00:00:00.000Z", "2133",
              "Stipendio"
            </p>
          </div>
          <button
            type="submit"
            disabled={!file || isUploading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
              ${
                !file || isUploading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Importing...
              </>
            ) : (
              <>
                <UploadIcon className="mr-2 h-4 w-4" />
                Import Transactions
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CsvImporter;
