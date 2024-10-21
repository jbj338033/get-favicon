import React, { useState } from "react";
import styled from "@emotion/styled";

// Types
interface FaviconUrls {
  [key: number]: string;
}

// Styled Components
const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const InputContainer = styled.div`
  margin-bottom: 32px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 16px;
  font-size: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

const Button = styled.button`
  width: 100%;
  margin-top: 16px;
  padding: 8px 24px;
  font-size: 16px;
  color: white;
  background-color: #3b82f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }

  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  margin-bottom: 16px;
  padding: 16px;
  color: #dc2626;
  background-color: #fee2e2;
  border-radius: 8px;
`;

const Flex = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-start;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`;

const SizeLabel = styled.div`
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
`;

const ImageContainer = styled.img<{ size: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  border-radius: 8px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  aspect-ratio: 1;
  border: 1px solid black;
`;

const sizes = [16, 32, 64, 128, 256, 512];

const FaviconDownloader: React.FC = () => {
  const [url, setUrl] = useState<string>("");
  const [favicons, setFavicons] = useState<FaviconUrls>({});
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getFavicons = async (): Promise<void> => {
    if (!url) {
      setError("URL을 입력해주세요");
      return;
    }

    setIsLoading(true);
    try {
      setError("");
      const faviconUrls: FaviconUrls = {};

      let domain = url;
      if (!url.startsWith("http")) {
        domain = `https://${url}`;
      }

      // URL 유효성 검사
      const urlObject = new URL(domain);

      sizes.forEach((size) => {
        // Google의 파비콘 API 사용 (CORS 없음)
        faviconUrls[
          size
        ] = `https://www.google.com/s2/favicons?sz=${size}&domain_url=${urlObject.href}`;
      });

      setFavicons(faviconUrls);
    } catch (error) {
      setError("올바른 URL을 입력해주세요");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <InputContainer>
        <Input
          type="text"
          value={url}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUrl(e.target.value)
          }
          placeholder="Enter URL (e.g. google.com)"
          disabled={isLoading}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && !isLoading) {
              getFavicons();
            }
          }}
        />
        <Button onClick={getFavicons} disabled={isLoading}>
          {isLoading ? "불러오는 중..." : "Extract Favicon"}
        </Button>
      </InputContainer>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Flex>
        {Object.entries(favicons).map(([size, url]) => (
          <Card key={size}>
            <SizeLabel>
              {size}x{size} px
            </SizeLabel>
            <ImageContainer
              size={size}
              src={url}
              alt={`Favicon ${size}x${size}`}
              style={{
                imageRendering: Number(size) < 64 ? "pixelated" : "auto",
                objectFit: "contain",
              }}
            />
          </Card>
        ))}
      </Flex>
    </Container>
  );
};

export default FaviconDownloader;
