import useOpenAIApiKey from "@/lib/hooks/useOpenAIApiKey";
import { Input } from "./ui/input";
import { Card, CardTitle, CardHeader, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { Field, FieldDescription, FieldLabel } from "./ui/field";
import { KeyIcon } from "lucide-react";

export default function OpenAIApiKeyInput() {
  const { openAIApiKey, setApiKey } = useOpenAIApiKey();

  return (
    <Field>
      <div className="flex items-center gap-2">
        <KeyIcon className="w-4 h-4" />
        <FieldLabel htmlFor="input-demo-api-key" className="text-sm">
          OpenAI API Key
        </FieldLabel>
      </div>
      <Input
        id="input-demo-api-key"
        type="password"
        placeholder="sk-..."
        className="text-xs"
        value={openAIApiKey ?? ""}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <FieldDescription className="text-xs">
        An API key is required to use image recognition features. You can get
        your API key from{" "}
        <span
          className="text-blue-500 0 cursor-pointer"
          onClick={() =>
            window.open(
              "https://platform.openai.com/account/api-keys",
              "_blank",
            )
          }
        >
          https://platform.openai.com/account/api-keys
        </span>
      </FieldDescription>
    </Field>
  );
}
