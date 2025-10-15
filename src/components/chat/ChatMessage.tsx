import React from 'react'

/**
 * @typedef {Object} ChatMessageProps
 * @property {string} message - Nội dung tin nhắn
 * @property {string} accentColor - Màu chủ đạo
 * @property {string} name - Tên người gửi
 * @property {boolean} isSelf - Có phải là tin nhắn của mình không
 * @property {boolean} [hideName] - Có ẩn tên không
 */

/**
 * Component hiển thị tin nhắn trong chat
 * @param {ChatMessageProps} props
 */
export const ChatMessage = ({
  name,
  message,
  accentColor,
  isSelf,
  hideName
}) => {
  return (
    <div className={`flex flex-col gap-1 ${hideName ? 'pt-0' : 'pt-6'}`}>
      {!hideName && (
        <div
          className={`text-${
            isSelf ? 'gray-700' : accentColor + '-800 text-ts-' + accentColor
          } uppercase text-xs`}
        >
          {name}
        </div>
      )}
      <div
        className={`pr-4 text-${
          isSelf ? 'gray-300' : accentColor + '-500'
        } text-sm ${
          isSelf ? '' : 'drop-shadow-' + accentColor
        } whitespace-pre-line`}
      >
        {message}
      </div>
    </div>
  )
}
