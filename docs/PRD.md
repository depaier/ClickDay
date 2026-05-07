**Product Requirements Document**

**ClickDay**

카메라 사진 + 지도 기반 촬영 정보 공유 플랫폼

| **문서 버전** | v1.0                                                             |
| ------------- | ---------------------------------------------------------------- |
| **작성일**    | 2026년 3월                                                       |
| **기술 스택** | Next.js 15 (App Router) + Supabase (PostgreSQL + Auth + Storage) |
| **플랫폼**    | 웹 (PWA) / iOS / Android                                         |
| **문서 상태** | Draft - 팀 리뷰 필요                                             |

# **목 차**

| **1\. 프로젝트 개요**                     | 3p  |
| ----------------------------------------- | --- |
| **2\. 기술 스택 상세**                    | 4p  |
| **3\. 데이터베이스 스키마 (Supabase)**    | 5p  |
| **4\. API 설계**                          | 8p  |
| **5\. 핵심 기능 명세**                    | 11p |
| **6\. EXIF 파싱 모듈**                    | 13p |
| **7\. 지도 연동 스펙**                    | 14p |
| **8\. 인증 및 보안**                      | 15p |
| **9\. 파일 스토리지 (Supabase Storage)**  | 16p |
| **10\. 프론트엔드 라우팅 및 페이지 구조** | 17p |
| **11\. 개발 태스크 분해 (스프린트 계획)** | 19p |
| **12\. 비기능 요구사항**                  | 23p |
| **13\. 테스트 전략**                      | 24p |
| **14\. 배포 및 운영**                     | 25p |

# **1\. 프로젝트 개요**

## **1.1 제품 목적**

ClickDay는 EXIF 메타데이터가 포함된 사진을 지도 위에 핀으로 공유하고, 촬영 장비·설정·보정 레시피를 커뮤니티와 나누는 모바일·웹 앱이다.

## **1.2 핵심 요구사항 요약**

| **MUST (MVP)** | |
| --- | | --- |
| → | 사진 업로드 시 EXIF 자동 추출 및 GPS 필수 검증 - EXIF 없으면 업로드 거부 |
| → | EXIF GPS 좌표 → 지도 핀 자동 배치 (Google Maps API) |
| → | 촬영 정보 카드: 카메라 모델, 렌즈, F값, SS, ISO, 초점거리 표시 |
| → | 지도 탐색: 클러스터링, 반경 검색, 현재 위치 기반 |
| → | 회원가입·로그인 (Supabase Auth - 이메일/소셜) |
| → | 피드 (최신순 / 인기순) |

| **SHOULD (v1.1)** | |
| --- | | --- |
| → | 보정 레시피 입력 (라이트룸 프리셋 이름, 소니 크리에이티브 룩, 후지 필름 레시피) |
| → | 팔로우 / 좋아요 / 댓글 / 북마크 |
| → | 스팟별 집계 (해당 위치 사진 목록, 많이 쓰인 장비 통계) |
| → | 프로필 페이지 |

| **WONT (v2.0+)** | |
| --- | | --- |
| → | AI 촬영 세팅 추천, B2B API, 유료 구독 결제 시스템, 브랜드 공식 배지 |

# **2\. 기술 스택 상세**

| **레이어**  | **기술**                | **버전/설정**     | **역할**                            |
| ----------- | ----------------------- | ----------------- | ----------------------------------- |
| Frontend    | Next.js                 | 15.x (App Router) | 웹 UI, SSR/SSG, PWA                 |
| Frontend    | TypeScript              | 5.x               | 타입 안전성                         |
| Frontend    | Tailwind CSS            | 3.x               | 유틸리티 CSS 스타일링               |
| Frontend    | React Query (TanStack)  | 5.x               | 서버 상태 관리·캐싱                 |
| Frontend    | Zustand                 | 4.x               | 클라이언트 상태 (UI, 지도 상태)     |
| Frontend    | exifr                   | 7.x               | 클라이언트 EXIF 파싱                |
| Map         | Google Maps API         | Weekly            | 지도 표시, 클러스터링, 지오코딩     |
| Backend/DB  | Supabase                | Cloud             | PostgreSQL, Auth, Storage, Realtime |
| Backend/DB  | PostgreSQL + PostGIS    | 15.x              | 공간 데이터 쿼리 (ST_DWithin 등)    |
| Storage     | Supabase Storage        | \-                | 원본·썸네일 이미지 저장             |
| 이미지 처리 | Sharp (Vercel Function) | 0.33              | 서버사이드 썸네일 생성, EXIF 재검증 |
| 배포        | Vercel                  | \-                | Next.js 자동 배포, Edge Function    |
| CI/CD       | GitHub Actions          | \-                | PR 테스트, 자동 배포                |

## **2.1 아키텍처 다이어그램 (텍스트)**

| →   | \[클라이언트\] Next.js (App Router) → Supabase Client SDK (인증·DB·Storage)   |
| --- | ----------------------------------------------------------------------------- |
| →   | \[클라이언트\] 사진 업로드 시 → exifr로 클라이언트 파싱 → EXIF 검증           |
| →   | \[서버\] Next.js Server Action → Sharp로 썸네일 생성 + 서버사이드 EXIF 재검증 |
| →   | \[지도\] Google Maps API ←→ 클라이언트 (핀·클러스터·마커 렌더링)              |
| →   | \[DB\] Supabase PostgreSQL + PostGIS → 공간 쿼리 (위도/경도 반경 검색)        |
| →   | \[Storage\] Supabase Storage → 원본 이미지 + 썸네일 CDN 배포                  |

# **3\. 데이터베이스 스키마 (Supabase / PostgreSQL)**

모든 테이블은 Supabase의 public 스키마에 생성하며, PostGIS 확장(geography 타입)을 활용한다.

## **3.1 users (프로필)**

\-- auth.users와 1:1 연결 (Supabase Auth 기본 테이블 확장)

CREATE TABLE public.profiles (

id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

username TEXT UNIQUE NOT NULL, -- @핸들

display_name TEXT,

avatar_url TEXT, -- Supabase Storage URL

bio TEXT,

gear_summary TEXT, -- 주 사용 장비 한줄 소개

follower_count INTEGER DEFAULT 0,

following_count INTEGER DEFAULT 0,

post_count INTEGER DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT NOW(),

updated_at TIMESTAMPTZ DEFAULT NOW()

);

## **3.2 posts (사진 게시물)**

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE public.posts (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

\-- 이미지

image_url TEXT NOT NULL, -- Supabase Storage 원본

thumbnail_url TEXT, -- 썸네일 (300x300)

\-- EXIF (필수)

camera_make TEXT, -- 제조사 (Sony, Canon ...)

camera_model TEXT NOT NULL, -- 카메라 모델명

lens_model TEXT, -- 렌즈명

focal_length NUMERIC(6,1), -- mm

aperture NUMERIC(5,2), -- F값 (예: 1.8)

shutter_speed TEXT, -- 예: '1/250'

iso INTEGER,

exposure_comp NUMERIC(4,1), -- EV 보정값

shot_at TIMESTAMPTZ, -- EXIF DateTimeOriginal

\-- 위치 (필수)

latitude NUMERIC(9,6) NOT NULL,

longitude NUMERIC(9,6) NOT NULL,

location GEOGRAPHY(POINT, 4326) -- PostGIS 공간 인덱스용

GENERATED ALWAYS AS (ST_Point(longitude, latitude)::geography) STORED,

location_name TEXT, -- 역지오코딩 결과 (선택)

\-- 보정 레시피 (선택)

recipe_type TEXT, -- 'lightroom'|'sony_cl'|'fuji'|'vsco'|'custom'

recipe_name TEXT,

recipe_detail JSONB, -- 각 레시피별 구조화된 설정값

\-- 메타

description TEXT,

tags TEXT\[\],

is_public BOOLEAN DEFAULT TRUE,

like_count INTEGER DEFAULT 0,

comment_count INTEGER DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT NOW(),

updated_at TIMESTAMPTZ DEFAULT NOW()

);

\-- 공간 인덱스

CREATE INDEX idx_posts_location ON posts USING GIST(location);

\-- 최신 피드 인덱스

CREATE INDEX idx_posts_created ON posts(created_at DESC);

\-- 사용자별 게시물

CREATE INDEX idx_posts_user_id ON posts(user_id);

## **3.3 likes**

CREATE TABLE public.likes (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,

created_at TIMESTAMPTZ DEFAULT NOW(),

UNIQUE(user_id, post_id)

);

## **3.4 comments**

CREATE TABLE public.comments (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,

user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

content TEXT NOT NULL CHECK(char_length(content) <= 500),

created_at TIMESTAMPTZ DEFAULT NOW()

);

## **3.5 follows**

CREATE TABLE public.follows (

follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

created_at TIMESTAMPTZ DEFAULT NOW(),

PRIMARY KEY (follower_id, following_id)

);

## **3.6 bookmarks**

CREATE TABLE public.bookmarks (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,

created_at TIMESTAMPTZ DEFAULT NOW(),

UNIQUE(user_id, post_id)

);

## **3.7 JSONB recipe_detail 스키마**

recipe_type별 recipe_detail 구조 예시:

\-- lightroom

{ "exposure": 0.5, "contrast": 10, "highlights": -30, "shadows": 20,

"whites": 0, "blacks": -10, "temp": 5200, "tint": 5,

"vibrance": 15, "saturation": 5, "preset_name": "Moody Film" }

\-- fuji (필름 레시피)

{ "film_simulation": "Velvia", "grain": "Strong", "color_chrome": "Strong",

"dynamic_range": "DR200", "highlight": -1, "shadow": 0,

"color": 2, "sharpness": 0, "noise_reduction": -4 }

\-- sony_cl (크리에이티브 룩)

{ "look": "FL", "contrast": 0, "saturation": 0, "sharpness": 0 }

# **4\. API 설계**

Next.js App Router의 Route Handler(/app/api/...)와 Supabase Client SDK를 함께 사용한다. 인증이 필요한 API는 Supabase Auth JWT를 검증한다.

## **4.1 엔드포인트 목록**

| **Method** | **Path**                | **인증**   | **설명**                                |
| ---------- | ----------------------- | ---------- | --------------------------------------- |
| POST       | /api/posts              | 필요       | 사진 업로드 + EXIF 검증 + 핀 생성       |
| GET        | /api/posts              | 불필요     | 피드 목록 (최신순/인기순, 페이지네이션) |
| GET        | /api/posts/:id          | 불필요     | 게시물 단건 조회                        |
| DELETE     | /api/posts/:id          | 필요(본인) | 게시물 삭제                             |
| GET        | /api/posts/nearby       | 불필요     | 반경 내 게시물 (lat, lng, radius)       |
| POST       | /api/posts/:id/like     | 필요       | 좋아요 토글                             |
| GET        | /api/posts/:id/comments | 불필요     | 댓글 목록                               |
| POST       | /api/posts/:id/comments | 필요       | 댓글 작성                               |
| DELETE     | /api/comments/:id       | 필요(본인) | 댓글 삭제                               |
| GET        | /api/users/:username    | 불필요     | 유저 프로필                             |
| PATCH      | /api/users/me           | 필요       | 내 프로필 수정                          |
| POST       | /api/users/:id/follow   | 필요       | 팔로우 토글                             |
| POST       | /api/bookmarks          | 필요       | 북마크 토글                             |
| GET        | /api/bookmarks          | 필요       | 내 북마크 목록                          |
| GET        | /api/spots/:lat/:lng    | 불필요     | 특정 좌표 스팟 통계                     |
| POST       | /api/upload/presign     | 필요       | Supabase Storage presigned URL 발급     |

## **4.2 POST /api/posts - 업로드 API 상세**

### **Request (multipart/form-data)**

image: File // 사진 파일 (JPEG/HEIC, 최대 20MB)

description?: string

tags?: string\[\]

recipe_type?: string

recipe_name?: string

recipe_detail?: JSON

### **서버 처리 흐름**

- multipart 파싱 → 파일 수신
- Sharp로 서버사이드 EXIF 재추출 (클라이언트 파싱 신뢰 불가)
- 필수 필드 검증: GPS(lat/lng), camera_model - 없으면 400 반환
- Sharp로 썸네일 생성 (600px 장변 리사이즈)
- Supabase Storage에 원본·썸네일 업로드
- posts 테이블 INSERT (location 컬럼 자동 생성)
- profiles.post_count +1 (RLS Function)
- 생성된 post 반환

### **Response 201**

{

"id": "uuid",

"image_url": "https://...",

"thumbnail_url": "https://...",

"camera_model": "ILCE-7M4",

"latitude": 37.5665,

"longitude": 126.9780,

...

}

### **Error 400 - EXIF 검증 실패**

{

"error": "EXIF_MISSING",

"message": "GPS 정보가 포함된 사진만 업로드 가능합니다."

}

## **4.3 GET /api/posts/nearby - 반경 검색 상세**

### **Query Params**

lat: number // 중심 위도

lng: number // 중심 경도

radius: number // 반경 (미터, 기본값 1000)

limit: number // 기본 50

cursor?: string // 커서 페이지네이션

### **SQL (Supabase RPC)**

SELECT p.\*, profiles.username, profiles.avatar_url,

ST_Distance(p.location, ST_Point(\$lng, \$lat)::geography) AS distance_m

FROM posts p

JOIN profiles ON profiles.id = p.user_id

WHERE ST_DWithin(

p.location,

ST_Point(\$lng, \$lat)::geography,

\$radius

)

AND p.is_public = TRUE

ORDER BY distance_m ASC

LIMIT \$limit;

# **5\. 핵심 기능 명세**

## **5.1 사진 업로드 플로우**

| **단계**                 | **담당**           | **처리 내용**                        | **실패 처리**                  |
| ------------------------ | ------------------ | ------------------------------------ | ------------------------------ |
| 1\. 파일 선택            | 클라이언트         | input\[type=file\] accept=image/\*   | \-                             |
| 2\. EXIF 사전 파싱       | 클라이언트 (exifr) | GPS, 카메라모델, F, SS, ISO 추출     | EXIF 없으면 모달로 업로드 거부 |
| 3\. 좌표 지도 미리보기   | 클라이언트         | Google Maps에 핀 미리보기 표시       | GPS 없으면 진행 불가           |
| 4\. 부가 정보 입력       | 클라이언트         | 설명, 태그, 보정 레시피 (선택)       | \-                             |
| 5\. presigned URL 발급   | 서버               | POST /api/upload/presign             | 인증 실패 시 401               |
| 6\. 원본 직접 업로드     | 클라이언트         | presigned URL로 Supabase Storage PUT | 업로드 실패 시 재시도          |
| 7\. EXIF 재검증 + DB저장 | 서버               | POST /api/posts - Sharp 재파싱·검증  | GPS 없으면 400 + 파일 삭제     |
| 8\. 완료                 | 클라이언트         | 성공 시 해당 핀으로 지도 이동        | \-                             |

## **5.2 지도 탐색 플로우**

- 초기 로드: 현재 위치(Geolocation API) 기반 지도 중심 설정, 없으면 서울 기본
- 핀 로드: 현재 뷰포트 바운딩 박스 기반 /api/posts/nearby 쿼리
- 클러스터링: Google Maps MarkerClusterer 적용 (zoom 레벨 13 이하)
- 핀 클릭: 사이드 패널 또는 바텀시트로 사진·정보 카드 표시
- 지도 이동 시: debounce 500ms 후 새 뷰포트로 자동 재쿼리

## **5.3 촬영 정보 카드 UI 명세**

| **필드**    | **표시 형식**            | **출처**              | **필수여부** |
| ----------- | ------------------------ | --------------------- | ------------ |
| 카메라 모델 | Sony α7 IV               | EXIF camera_model     | 필수         |
| 렌즈        | FE 24-70mm F2.8 GM       | EXIF lens_model       | 선택         |
| 초점거리    | 35mm                     | EXIF focal_length     | 선택         |
| 조리개      | f/2.8                    | EXIF aperture         | 선택         |
| 셔터스피드  | 1/500s                   | EXIF shutter_speed    | 선택         |
| ISO         | ISO 400                  | EXIF iso              | 선택         |
| 촬영 시각   | 2026.03.15 14:30         | EXIF shot_at          | 선택         |
| 보정 레시피 | Fuji Velvia / Moody Film | 사용자 입력           | 선택         |
| 촬영 위치   | 서울 종로구 (지도 핀)    | EXIF GPS → 역지오코딩 | 필수         |

# **6\. EXIF 파싱 모듈**

## **6.1 클라이언트 사이드 (exifr)**

// lib/exif/parseExif.ts

import \* as exifr from 'exifr';

export interface ExifData {

latitude: number;

longitude: number;

make?: string;

model: string;

lensModel?: string;

focalLength?: number;

fNumber?: number;

exposureTime?: string;

iso?: number;

exposureCompensation?: number;

dateTimeOriginal?: Date;

}

export async function parseExif(file: File): Promise&lt;ExifData | null&gt; {

const exif = await exifr.parse(file, {

gps: true,

tiff: true,

exif: true,

ifd0: \['Make', 'Model'\],

});

if (!exif?.latitude || !exif?.longitude || !exif?.Model) {

return null; // 업로드 거부 트리거

}

return {

latitude: exif.latitude,

longitude: exif.longitude,

make: exif.Make,

model: exif.Model,

lensModel: exif.LensModel,

focalLength: exif.FocalLength,

fNumber: exif.FNumber,

exposureTime: exif.ExposureTime ? \`1/\${Math.round(1/exif.ExposureTime)}\` : undefined,

iso: exif.ISO,

dateTimeOriginal: exif.DateTimeOriginal,

};

}

## **6.2 서버 사이드 재검증 (Sharp)**

// lib/exif/serverValidate.ts (Next.js Server Action / Route Handler)

import sharp from 'sharp';

export async function serverValidateExif(buffer: Buffer) {

const metadata = await sharp(buffer).metadata();

const exif = metadata.exif;

if (!exif) throw new Error('EXIF_MISSING');

// EXIF 바이너리에서 GPS IFD 파싱

// exifr를 Node 환경에서 재사용 가능

const parsed = await exifr.parse(buffer, { gps: true });

if (!parsed?.latitude || !parsed?.longitude) throw new Error('GPS_MISSING');

return parsed;

}

# **7\. 지도 연동 스펙**

## **7.1 Google Maps API 설정**

// .env.local

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key

GOOGLE_MAPS_SERVER_API_KEY=your_server_key // 서버사이드 역지오코딩용

## **7.2 핵심 컴포넌트**

| **컴포넌트**     | **파일 위치**                       | **역할**                           |
| ---------------- | ----------------------------------- | ---------------------------------- |
| GoogleMap        | components/map/GoogleMap.tsx        | 지도 초기화, 마커 렌더링, 이벤트   |
| MapPin           | components/map/MapPin.tsx           | 커스텀 핀 (썸네일 + 카메라 아이콘) |
| ClusterLayer     | components/map/ClusterLayer.tsx     | MarkerClustering 래퍼              |
| MapSearchBar     | components/map/MapSearchBar.tsx     | 위치명 검색 (Google Places API)    |
| RadiusControl    | components/map/RadiusControl.tsx    | 반경 슬라이더 UI                   |
| PostPreviewSheet | components/map/PostPreviewSheet.tsx | 핀 클릭 시 바텀시트                |

## **7.3 역지오코딩 (서버)**

// Google 좌표 → 주소 변환 API

GET <https://maps.googleapis.com/maps/api/geocode/json>

?latlng={latitude},{longitude}&key={GOOGLE_MAPS_SERVER_API_KEY}

// 응답에서 results\[0\].formatted_address 추출 → posts.location_name 저장

// 응답에서 results\[0\].formatted_address 추출 → posts.location_name 저장

# **8\. 인증 및 보안**

## **8.1 Supabase Auth 설정**

- 이메일/패스워드 로그인 (기본)
- 소셜 로그인: Google OAuth (MVP), Apple Sign-In (v1.1)
- JWT 세션: Supabase가 관리, Next.js middleware에서 검증

## **8.2 Row Level Security (RLS) 정책**

\-- profiles: 누구나 읽기, 본인만 수정

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (TRUE);

CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

\-- posts: public은 누구나 읽기, 본인만 insert/delete

CREATE POLICY "posts_select" ON posts FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = user_id);

\-- likes/bookmarks/follows: 인증 사용자 본인 데이터만

CREATE POLICY "likes_all" ON likes USING (auth.uid() = user_id);

CREATE POLICY "bookmarks_all" ON bookmarks USING (auth.uid() = user_id);

## **8.3 보안 고려사항**

- 파일 업로드: MIME 타입 검증 (image/jpeg, image/heic, image/png 허용)
- 파일 크기: 20MB 상한 (Next.js body size limit 설정)
- Rate Limiting: Vercel Edge Config 또는 Upstash Redis로 업로드 API 제한 (10회/분/유저)
- GPS 개인정보: 사용자가 '정확도 축소' 옵션 선택 시 소수점 2자리로 반올림 (약 1km 정밀도)
- 이미지 메타데이터 스트립: CDN 배포 전 EXIF 제거 (위치 노출 방지 - 위치는 DB에만 저장)

# **9\. 파일 스토리지 (Supabase Storage)**

## **9.1 버킷 구조**

posts/ // 게시물 이미지 (public 버킷)

{user_id}/{post_id}/original.jpg

{user_id}/{post_id}/thumb_600.jpg

avatars/ // 프로필 사진 (public 버킷)

{user_id}/avatar.jpg

## **9.2 업로드 정책**

| **항목**       | **설정값**                                                    |
| -------------- | ------------------------------------------------------------- |
| 최대 파일 크기 | 20 MB                                                         |
| 허용 MIME      | image/jpeg, image/heic, image/png, image/webp                 |
| 썸네일 기준    | 장변 600px (Sharp resize, webp 변환)                          |
| CDN 캐시       | Supabase Storage CDN, Cache-Control: public, max-age=31536000 |
| 버킷 접근      | posts 버킷: public read / authenticated write                 |

# **10\. 프론트엔드 라우팅 및 페이지 구조**

## **10.1 Next.js App Router 파일 구조**

app/

layout.tsx // 전역 레이아웃 (Navbar, Auth Provider)

page.tsx // / → 지도 메인 (SSR)

(auth)/

login/page.tsx // /login

signup/page.tsx // /signup

(app)/

feed/page.tsx // /feed - 최신/인기 피드

upload/page.tsx // /upload - 사진 업로드

posts/\[id\]/page.tsx // /posts/:id - 게시물 상세

users/\[username\]/page.tsx // /users/:username - 프로필

bookmarks/page.tsx // /bookmarks - 내 북마크

settings/page.tsx // /settings - 설정

api/

posts/route.ts // GET, POST

posts/\[id\]/route.ts // GET, DELETE

posts/nearby/route.ts // GET

posts/\[id\]/like/route.ts // POST

posts/\[id\]/comments/route.ts

users/\[username\]/route.ts

users/me/route.ts

users/\[id\]/follow/route.ts

bookmarks/route.ts

upload/presign/route.ts

spots/\[lat\]/\[lng\]/route.ts

## **10.2 페이지별 데이터 패칭 전략**

| **페이지**       | **렌더링** | **데이터 패칭**                                      |
| ---------------- | ---------- | ---------------------------------------------------- |
| / (지도 메인)    | CSR        | 클라이언트에서 뷰포트 변경마다 /api/posts/nearby     |
| /feed            | SSR + ISR  | 초기 데이터 서버 패칭, 이후 React Query로 무한스크롤 |
| /posts/:id       | SSR        | OG 메타태그 포함 서버 렌더링 (소셜 공유 대응)        |
| /users/:username | SSR        | 프로필 + 최근 게시물 서버 패칭                       |
| /upload          | CSR        | 인증 필요, 완전 클라이언트 사이드                    |

## **10.3 컴포넌트 구조**

components/

map/ // 지도 관련 (GoogleMap, MapPin, ClusterLayer ...)

post/ // PostCard, PostDetailModal, ExifInfoCard, RecipeCard

upload/ // UploadDropzone, ExifPreview, RecipeForm

user/ // UserAvatar, ProfileHeader, FollowButton

ui/ // Button, Input, Modal, Sheet, Badge, Spinner

layout/ // Navbar, BottomNav (모바일), Sidebar

lib/

supabase/ // createClient, serverClient, middleware

exif/ // parseExif.ts, serverValidate.ts

google/ // initGoogleMap, reverseGeocode

hooks/ // useAuth, useMap, usePosts, useInfiniteScroll

types/ // Post, Profile, ExifData, RecipeDetail 타입 정의

# **11\. 개발 태스크 분해 (스프린트 계획)**

총 12개 스프린트 (1스프린트 = 2주). MVP 완성 목표: Sprint 6 (2026.07 말).

## **Sprint 1 (2026.03.01~03.14) - 프로젝트 초기화 및 기반 설정**

| **태스크 ID** | **태스크명**                                     | **담당** | **예상 시간** |
| ------------- | ------------------------------------------------ | -------- | ------------- |
| S1-01         | GitHub 레포 초기화 + ESLint/Prettier 설정        | 팀 전체  | 2h            |
| S1-02         | Next.js 15 + TypeScript + Tailwind 프로젝트 생성 | FE       | 3h            |
| S1-03         | Supabase 프로젝트 생성 + 로컬 개발 환경 연결     | BE       | 2h            |
| S1-04         | PostGIS 확장 활성화 + DB 스키마 v1 작성          | BE       | 6h            |
| S1-05         | Supabase Auth 설정 (이메일·Google OAuth)         | BE       | 4h            |
| S1-06         | 환경변수 관리 (.env.local 구조) 확정             | PM       | 1h            |
| S1-07         | 디자인 시스템 초안 (색상·타이포·컴포넌트 토큰)   | Design   | 8h            |
| S1-08         | Google Maps API 키 발급 및 초기 렌더링 PoC       | FE       | 4h            |

## **Sprint 2 (2026.03.15~03.28) - 인증 + 프로필**

| **태스크 ID** | **태스크명**                                       | **담당** | **예상 시간** |
| ------------- | -------------------------------------------------- | -------- | ------------- |
| S2-01         | 로그인 / 회원가입 페이지 UI                        | FE       | 8h            |
| S2-02         | Supabase Auth 클라이언트 훅 (useAuth)              | FE       | 4h            |
| S2-03         | 미들웨어: 인증 필요 페이지 보호                    | FE       | 3h            |
| S2-04         | 회원가입 시 profiles 테이블 자동 생성 (DB Trigger) | BE       | 4h            |
| S2-05         | 프로필 페이지 UI (정보 표시)                       | FE       | 6h            |
| S2-06         | 프로필 수정 API (PATCH /api/users/me)              | BE       | 4h            |
| S2-07         | 아바타 업로드 (Supabase Storage)                   | FE+BE    | 5h            |
| S2-08         | RLS 정책 전체 테이블 적용 + 테스트                 | BE       | 6h            |

## **Sprint 3 (2026.03.29~04.11) - EXIF 파싱 + 업로드 UI**

| **태스크 ID** | **태스크명**                                   | **담당** | **예상 시간** |
| ------------- | ---------------------------------------------- | -------- | ------------- |
| S3-01         | exifr 클라이언트 파싱 모듈 개발 (parseExif.ts) | FE       | 6h            |
| S3-02         | EXIF 없는 사진 업로드 거부 UI (모달+안내)      | FE       | 4h            |
| S3-03         | 업로드 드래그앤드롭 UI (UploadDropzone)        | FE       | 6h            |
| S3-04         | EXIF 미리보기 컴포넌트 (ExifPreview)           | FE       | 5h            |
| S3-05         | 서버사이드 EXIF 재검증 (Sharp)                 | BE       | 6h            |
| S3-06         | Presigned URL 발급 API                         | BE       | 4h            |
| S3-07         | 보정 레시피 입력 폼 (RecipeForm)               | FE       | 8h            |
| S3-08         | HEIC → JPEG 클라이언트 변환 (heic2any)         | FE       | 4h            |

## **Sprint 4 (2026.04.12~04.25) - 지도 메인 + 핀**

| **태스크 ID** | **태스크명**                                  | **담당** | **예상 시간** |
| ------------- | --------------------------------------------- | -------- | ------------- |
| S4-01         | GoogleMap 컴포넌트 완성 (초기화·이벤트)       | FE       | 8h            |
| S4-02         | 커스텀 핀 컴포넌트 (썸네일 원형 마커)         | FE       | 6h            |
| S4-03         | MarkerClustering 적용                         | FE       | 5h            |
| S4-04         | 뷰포트 변경 시 자동 핀 재로드 (debounce)      | FE       | 4h            |
| S4-05         | PostPreviewSheet (바텀시트) 컴포넌트          | FE       | 6h            |
| S4-06         | GET /api/posts/nearby (PostGIS ST_DWithin)    | BE       | 6h            |
| S4-07         | 역지오코딩 서비스 (Google Maps Geocoding API) | BE       | 4h            |
| S4-08         | 현재 위치 기반 지도 초기화                    | FE       | 3h            |

## **Sprint 5 (2026.04.26~05.09) - 게시물 저장·피드**

| **태스크 ID** | **태스크명**                            | **담당** | **예상 시간** |
| ------------- | --------------------------------------- | -------- | ------------- |
| S5-01         | POST /api/posts 완성 (썸네일 생성 포함) | BE       | 8h            |
| S5-02         | 업로드 완료 → 지도 핀 자동 이동 흐름    | FE       | 4h            |
| S5-03         | 게시물 상세 페이지 (/posts/:id)         | FE       | 6h            |
| S5-04         | ExifInfoCard + RecipeCard 컴포넌트 완성 | FE       | 6h            |
| S5-05         | 피드 페이지 (/feed) - 최신순            | FE       | 5h            |
| S5-06         | 무한 스크롤 훅 (useInfiniteScroll)      | FE       | 4h            |
| S5-07         | 게시물 삭제 API + UI                    | FE+BE    | 3h            |
| S5-08         | OG 메타태그 서버 렌더링 (게시물 공유)   | FE       | 4h            |

## **Sprint 6 (2026.05.10~05.23) - MVP 통합 + 버그픽스**

| **태스크 ID** | **태스크명**                              | **담당** | **예상 시간** |
| ------------- | ----------------------------------------- | -------- | ------------- |
| S6-01         | E2E 플로우 통합 테스트 (업로드 → 핀 표시) | 팀 전체  | 12h           |
| S6-02         | 모바일 반응형 UI 전체 점검                | FE       | 8h            |
| S6-03         | 에러 핸들링 통일 (글로벌 에러 UI)         | FE       | 4h            |
| S6-04         | 이미지 로딩 최적화 (next/image, lazy)     | FE       | 4h            |
| S6-05         | Vercel 배포 파이프라인 확정               | BE       | 3h            |
| S6-06         | 사용자 피드백 반영 (내부 테스트)          | 팀 전체  | 8h            |
| S6-07         | MVP 체크리스트 전체 통과 확인             | PM       | 4h            |

## **Sprint 7~8 (2026.05.24~06.20) - 소셜 기능**

| **태스크 ID** | **태스크명**                             | **담당** | **예상 시간** |
| ------------- | ---------------------------------------- | -------- | ------------- |
| S7-01         | 좋아요 API + UI (낙관적 업데이트)        | FE+BE    | 6h            |
| S7-02         | 댓글 API + UI                            | FE+BE    | 8h            |
| S7-03         | 북마크 API + UI + 북마크 페이지          | FE+BE    | 6h            |
| S7-04         | 팔로우 API + UI                          | FE+BE    | 6h            |
| S7-05         | 피드 - 팔로잉 게시물 탭 추가             | FE+BE    | 6h            |
| S7-06         | 알림 시스템 기초 (Supabase Realtime)     | BE       | 8h            |
| S7-07         | 스팟 통계 API + UI (해당 위치 인기 장비) | FE+BE    | 8h            |
| S7-08         | 검색 기능 (카메라 모델·위치명 검색)      | FE+BE    | 8h            |

## **Sprint 9~10 (2026.06.21~07.18) - 베타 + 피드백**

- 베타 테스터 300명 모집 (카메라 커뮤니티)
- 피드백 수집 폼 (인앱 + Google Form)
- 크래시·성능 모니터링 (Vercel Analytics + Sentry)
- 피드백 기반 UX 개선 2~3회 반복

## **Sprint 11~12 (2026.07.19~08.16) - 수익화 + 출시 준비**

- 프리미엄 구독 플로우 설계 및 결제 연동 (토스페이먼츠 또는 스트라이프)
- 앱스토어·플레이스토어 등록 준비 (PWA → React Native 래퍼 검토)
- 사업계획서 고도화 및 경진대회 출전 준비
- 마케팅 랜딩 페이지 제작

# **12\. 비기능 요구사항**

| **항목**               | **목표값**                  | **측정 방법**                     |
| ---------------------- | --------------------------- | --------------------------------- |
| 페이지 초기 로드 (LCP) | < 2.5초 (3G 기준)           | Vercel Analytics / Lighthouse     |
| 지도 핀 로드 응답시간  | < 500ms (100핀 이하)        | API 응답 시간 로깅                |
| 이미지 업로드 성공률   | \> 99%                      | Supabase Storage 업로드 성공 비율 |
| 동시 접속자 처리       | Vercel 서버리스 자동 스케일 | 부하 테스트 (k6)                  |
| 가용성 (Uptime)        | \> 99.5%                    | Vercel + Supabase SLA             |
| 모바일 반응형          | iPhone 12 / Galaxy S21 기준 | 실기기 + BrowserStack             |
| 접근성                 | WCAG 2.1 AA 수준            | axe DevTools 검사                 |
| EXIF 파싱 시간         | < 300ms (20MB 파일)         | 클라이언트 성능 측정              |

# **13\. 테스트 전략**

## **13.1 테스트 레벨**

| **레벨**    | **도구**                 | **대상**                        | **커버리지 목표** |
| ----------- | ------------------------ | ------------------------------- | ----------------- |
| 단위 테스트 | Vitest + Testing Library | EXIF 파싱 모듈, 유틸 함수       | 80%+              |
| 통합 테스트 | Vitest + Supabase 로컬   | API Route Handler, DB 쿼리      | 70%+              |
| E2E 테스트  | Playwright               | 업로드 → 핀 표시, 로그인 플로우 | 핵심 플로우 100%  |
| 시각적 회귀 | Chromatic (Storybook)    | UI 컴포넌트                     | 주요 컴포넌트     |

## **13.2 핵심 테스트 케이스**

- EXIF 없는 사진 업로드 시 400 에러 + UI 거부 메시지 확인
- GPS 없는 사진 업로드 시 거부 확인
- 정상 EXIF 사진 업로드 → DB 저장 → 지도 핀 표시까지 E2E
- 좌표 경계값 테스트 (극지방, 날짜변경선 근처)
- HEIC 파일 변환 + EXIF 파싱 정상 동작
- RLS 정책: 타인 게시물 삭제 시 403 확인
- 동시 좋아요 요청 시 중복 방지 (UNIQUE 제약)

# **14\. 배포 및 운영**

## **14.1 배포 환경**

| **환경**           | **URL**                   | **배포 트리거**  |
| ------------------ | ------------------------- | ---------------- |
| 개발 (dev)         | localhost:3000            | 로컬 실행        |
| 스테이징 (preview) | \*.vercel.app (PR별 자동) | PR 생성·업데이트 |
| 프로덕션 (prod)    | clickday.kr (예정)        | main 브랜치 머지 |

## **14.2 GitHub Actions CI/CD**

\# .github/workflows/ci.yml

on: \[push, pull_request\]

jobs:

test:

\- npx vitest run

\- npx playwright test (E2E, main 브랜치만)

build:

\- next build

deploy:

\- Vercel CLI deploy (자동)

## **14.3 모니터링**

- 에러 추적: Sentry (프론트엔드 + Next.js 서버)
- 성능: Vercel Analytics (Core Web Vitals)
- DB: Supabase 대시보드 (쿼리 성능, 스토리지 사용량)
- 업타임: UptimeRobot (무료 플랜 5분 주기 체크)

**ClickDay PRD v1.0 | Next.js + Supabase | 2026.03**