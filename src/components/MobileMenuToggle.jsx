import React from 'react';
import styled from 'styled-components';

const ToggleButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  
  &:hover {
    background: #2563eb;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const HamburgerIcon = styled.div`
  width: 20px;
  height: 20px;
  position: relative;
  
  span {
    display: block;
    position: absolute;
    height: 2px;
    width: 100%;
    background: currentColor;
    border-radius: 1px;
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition: .25s ease-in-out;
    
    &:nth-child(1) {
      top: 0px;
      transform-origin: left center;
    }
    
    &:nth-child(2) {
      top: 9px;
      transform-origin: left center;
    }
    
    &:nth-child(3) {
      top: 18px;
      transform-origin: left center;
    }
  }
  
  ${props => props.isOpen && `
    span:nth-child(1) {
      transform: rotate(45deg);
      top: -1px;
      left: 4px;
    }
    
    span:nth-child(2) {
      width: 0%;
      opacity: 0;
    }
    
    span:nth-child(3) {
      transform: rotate(-45deg);
      top: 19px;
      left: 4px;
    }
  `}
`;

const MobileMenuToggle = ({ isOpen, onClick }) => {
  return (
    <ToggleButton onClick={onClick}>
      <HamburgerIcon isOpen={isOpen}>
        <span></span>
        <span></span>
        <span></span>
      </HamburgerIcon>
    </ToggleButton>
  );
};

export default MobileMenuToggle;
