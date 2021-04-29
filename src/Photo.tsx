import { h } from 'preact';
import { useEffect, useLayoutEffect, useState } from 'preact/hooks';
import { sized } from './contentful';
import styled from 'styled-components';

import CloseIcon from './x.svg';
import NextIcon from './chevron-right.svg';
import PrevIcon from './chevron-left.svg';

const Dim = styled.div`
  display: flex;
  position: relative;
  height: 100vh;
  width: 100%;
  @media (min-width: ${(props) => props.theme.mobileBreakpoint}) {
    width: calc(100vw - 2 * var(--grid-gap));
    height: calc(100vh - 2 * var(--grid-gap));
    margin: var(--grid-gap) var(--grid-gap) 0 var(--grid-gap);
  }
`;
const Fullscreen = styled.div`
  height: 100%;
  width: 100%;
  @media (min-width: ${(props) => props.theme.mobileBreakpoint}) {
    width: calc(100vw - 3 * var(--grid-gap));
  }
  background-position: 50% 50%;
  background-repeat: no-repeat;
`;
const PrevNav = styled.div`
  position: absolute;
  width: 50%;
  height: 100%;
  left: 0;
  display: flex;
  align-content: center;
  align-items: center;
  color: white;
  svg {
    display: none;
  }
  &:hover {
    svg {
      display: inline-block;
      opacity: 50%;
    }
  }
`;
const NextNav = styled(PrevNav)`
  left: auto;
  right: 0;
  justify-content: flex-end;
`;
const Button = styled.button`
  color: white;
  position: absolute;
  top: 0;
  right: 0;
  padding: 0;
  border: 0;
  background: transparent;
  opacity: 50%;
`;

export const Photo = ({
  id,
  onNext,
  onPrev,
  onClose,
  onLoad,
}: {
  id: string;
  onNext?: () => unknown;
  onPrev?: () => unknown;
  onClose?: () => unknown;
  onLoad?: ({ width, height }: { width: number; height: number }) => unknown;
}) => {
  const [photo, setPhoto] = useState<Photo | undefined>(undefined);
  const [photoSrc, setPhotoSrc] = useState<string | undefined>(undefined);

  useLayoutEffect(() => {
    window.onkeyup = ({ key }: KeyboardEvent) => {
      switch (key) {
        case 'ArrowRight':
          onNext?.();
          return;
        case 'ArrowLeft':
          onPrev?.();
          return;
        case 'Escape':
          onClose?.();
          return;
      }
    };
  }, []);

  useEffect(() => {
    fetch(`/data/photos/${id}.json`)
      .then((res) => res.json())
      .then((p) => {
        setPhoto({ ...p, id });
        setPhotoSrc(
          sized({
            width: window.innerWidth,
            height: window.innerHeight,
          })({ ...p, id }),
        );
      })
      .catch(() => {
        console.error(`Failed to load photo data: ${id}`);
      });
  }, [id]);

  useEffect(() => {
    if (photoSrc === undefined) return;
    fetch(photoSrc).then(() =>
      onLoad?.({
        width: window.innerWidth,
        height: window.innerHeight,
      }),
    );
  }, [photoSrc]);

  if (photo === undefined) return null;

  return (
    <Dim>
      <Fullscreen
        style={{
          backgroundImage: photoSrc ? `url(${photoSrc})` : undefined,
        }}
      />
      <PrevNav onClick={() => onPrev?.()}>
        <PrevIcon />
      </PrevNav>
      <NextNav onClick={() => onNext?.()}>
        <NextIcon />
      </NextNav>
      <Button onClick={() => onClose?.()}>
        <CloseIcon />
      </Button>
    </Dim>
  );
};
