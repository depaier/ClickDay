# 🚨 Implementation Plan: Premium Alert System

본 문서는 브라우저 기본 `alert()`를 대체하는 ClickDay만의 커스텀 Alert 시스템 구축을 위한 상세 구현 계획서입니다.

## 1. 개요 (Overview)
- **목적**: 투박한 브라우저 기본 UI를 제거하고, 앱의 디자인 시스템(Hasselblad Design System)에 부합하는 프리미엄 Alert/Confirm 모달 구축.
- **주요 특징**: 전역 상태 기반 호출, 글래스모피즘 디자인, 부드러운 애니메이션, 비동기(Promise) 지원 Confirm 창.

## 2. 기술 스펙 (Technical Stack)
- **State**: `Zustand` (전역 상태 관리)
- **Styling**: `Tailwind CSS v4` + `Lucide React` (아이콘)
- **Components**: `Radix UI Slot` (필요 시 확장성 고려)
- **Design Tokens**: 
  - Glassmorphism (Backdrop blur 20px+)
  - Multi-layered Soft Shadows
  - Brand Accent Colors (Emerald, Rose, Amber)

## 3. 주요 변경 사항 (Key Changes)

### 3.1 전역 스토어 구축 (`src/store/useAlertStore.ts`)
- Alert의 상태(Open/Close, Title, Message, Type, Callback)를 관리하는 스토어 생성.
- `showAlert`, `showConfirm`, `hideAlert` 액션 정의.

### 3.2 컴포넌트 구현 (`src/components/common/CustomAlert.tsx`)
- **Overlay**: 클릭 시 닫기 방지(또는 선택적 허용) 기능이 포함된 배경 흐림 처리.
- **Card**: 
  - 상단: 상황별 아이콘 (성공/에러/경고).
  - 중단: 타이틀 및 상세 설명.
  - 하단: 액션 버튼 (확인/취소).

### 3.3 전역 프로바이더 설정 (`src/app/layout.tsx`)
- 최상단 레이아웃에 `CustomAlert` 컴포넌트를 배치하여 어디서든 상태만 변경하면 화면에 나타나도록 설정.

## 4. 상세 구현 단계 (Step-by-Step)

### Phase 1: 기반 구조 (Core Foundation)
- [x] `useAlertStore.ts` 생성: 기본 인터페이스 및 Zustand 스토어 정의.
- [x] `CustomAlert.tsx` 기초 마크업: Tailwind CSS를 이용한 글래스모피즘 UI 프레임워크 작성.

### Phase 2: 기능 연동 (Logic & Interaction)
- [x] `showConfirm` 호출 시 `Promise`를 반환하여 `await`로 사용자 응답을 처리할 수 있는 로직 구현.
- [x] 키보드 이벤트 처리 (Esc 키로 닫기 등).
- [x] Framer Motion 또는 CSS Transition을 이용한 등장/퇴장 애니메이션 고도화.

### Phase 3: 전역 적용 (Integration)
- [x] `layout.tsx`에 컴포넌트 삽입.
- [x] 주요 지점(포스트 삭제, 업로드, 회원가입 등)의 `alert()`를 `useAlert` 훅으로 교체.
- [x] 프로젝트 내 모든 잔여 `alert()` 지점 전수 교체 및 다국어 지원 적용.
- [x] 위험 작업(삭제 등)을 위한 버튼 스타일(`danger` variant) 적용.


## 5. 디자인 가이드 (Design Guide)
- **성공(Success)**: `#10b981` (Emerald) 포인트 컬러 및 Check 아이콘.
- **에러(Error)**: `#f43f5e` (Rose) 포인트 컬러 및 AlertCircle 아이콘.
- **경고(Warning)**: `#f59e0b` (Amber) 포인트 컬러 및 Triangle 아이콘.
- **배경**: `bg-white/70` (Light) / `bg-zinc-900/70` (Dark) + `backdrop-blur-xl`.

---
> [!NOTE]
> 이 계획서에 따라 구현을 시작하기 전, 추가로 수정하거나 고려해야 할 인터랙션 요소가 있다면 말씀해 주세요.
