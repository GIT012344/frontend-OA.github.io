import React from 'react';
import PropTypes from 'prop-types';

// Local fallback mapping for status colors. If your application already has a
// centralised STATUS_OPTIONS array, feel free to remove this and pass the text
// colour via the `statusColor` prop instead.
const STATUS_OPTIONS = [
  { value: 'New', textColor: '#0369a1' },
  { value: 'In Process', textColor: '#4f46e5' },
  { value: 'Pending', textColor: '#f59e0b' },
  { value: 'Done', textColor: '#16a34a' },
  { value: 'Reject', textColor: '#b91c1c' },
];

const StatusChangeModal = ({
  isOpen,
  onClose,
  oldStatus,
  newStatus,
  remarks,
  onRemarksChange,
  onConfirm,
  isSaving,
}) => {
  if (!isOpen) return null;

  const statusColor =
    STATUS_OPTIONS.find((s) => s.value === newStatus)?.textColor || '#1e293b';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          width: '500px',
          maxWidth: '90%',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, color: '#1e293b' }}>
          เปลี่ยนสถานะจาก{' '}
          <span style={{ color: '#64748b' }}>{oldStatus}</span> เป็น{' '}
          <span style={{ color: statusColor, fontWeight: 600 }}>{newStatus}</span>
        </h3>

        <div style={{ margin: '16px 0' }}>
          <label
            style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}
          >
            หมายเหตุ (ไม่บังคับ)
          </label>
          <textarea
            value={remarks}
            onChange={(e) => onRemarksChange(e.target.value)}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.95rem',
              resize: 'vertical',
            }}
            placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับการเปลี่ยนสถานะนี้..."
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
          }}
        >
          <button
            onClick={onClose}
            disabled={isSaving}
            style={{
              padding: '10px 16px',
              background: '#f1f5f9',
              color: '#64748b',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isSaving}
            style={{
              padding: '10px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isSaving ? (
              <>
                <span>กำลังบันทึก...</span>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              </>
            ) : (
              'ยืนยันการเปลี่ยนสถานะ'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

StatusChangeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  oldStatus: PropTypes.string,
  newStatus: PropTypes.string,
  remarks: PropTypes.string,
  onRemarksChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isSaving: PropTypes.bool,
};

export default StatusChangeModal;
