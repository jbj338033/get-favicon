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
  padding: 24px;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
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

const ImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  width: 100%;
  max-width: 200px;
  aspect-ratio: 1;
`;

const DownloadButton = styled.button`
  padding: 6px 16px;
  font-size: 14px;
  color: #4b5563;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e2e8f0;
    color: #1f2937;
  }

  &:active {
    transform: translateY(1px);
  }
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

  const downloadFavicon = async (
    size: number,
    imageUrl: string
  ): Promise<void> => {
    try {
      // 캔버스를 사용하여 이미지 다운로드
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Canvas context not supported");
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error("Blob creation failed");
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `favicon-${size}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, "image/png");
      };

      img.onerror = () => {
        throw new Error("Image loading failed");
      };

      // Google의 파비콘 API를 통해 이미지 로드
      img.src = imageUrl;
    } catch (error) {
      setError("다운로드 중 오류가 발생했습니다");
      console.error(error);
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
        />
        <Button onClick={getFavicons} disabled={isLoading}>
          {isLoading ? "불러오는 중..." : "파비콘 가져오기"}
        </Button>
      </InputContainer>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Grid>
        {Object.entries(favicons).map(([size, url]) => (
          <Card key={size}>
            <SizeLabel>
              {size}x{size} px
            </SizeLabel>
            <ImageContainer>
              <img
                src={url}
                alt={`Favicon ${size}x${size}`}
                width={Number(size)}
                height={Number(size)}
                style={{
                  imageRendering: Number(size) < 64 ? "pixelated" : "auto",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </ImageContainer>
            <DownloadButton onClick={() => downloadFavicon(Number(size), url)}>
              다운로드
            </DownloadButton>
          </Card>
        ))}
      </Grid>
    </Container>
  );
};

export default FaviconDownloader;
