import { useEffect } from 'react'

/**
 * Custom hook to dynamically update document title and meta description per page
 * @param {string} title - Page title suffix (prepended with " | TraceIt")
 * @param {string} description - Meta description content
 */
export function useDocumentTitle(title, description) {
  useEffect(() => {
    const prevTitle = document.title
    const fullTitle = title ? `${title} | TraceIt` : 'TraceIt — AI-Powered Campus Lost & Found'
    document.title = fullTitle

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]')
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.name = 'description'
        document.head.appendChild(metaDesc)
      }
      metaDesc.setAttribute('content', description)
    }

    return () => {
      document.title = prevTitle
    }
  }, [title, description])
}

export default useDocumentTitle
