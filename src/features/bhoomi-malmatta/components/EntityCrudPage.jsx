import { useEffect, useState, useCallback, useRef } from 'react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import Modal from './Modal'
import Pagination from './Pagination'
import DocumentsPanel from './DocumentsPanel'
import AuditPanel from './AuditPanel'
import StatusBadge from './StatusBadge'
import { PropertyCategory, PropertyStatus, PropertyZones, PropertyWards } from '../config/labels'

let propertyOptionsPromise
const emptyParams = {}

/**
 * सर्व sections साठी सामायिक CRUD घटक: Add / View / Edit / Update / Search / Filter /
 * Pagination / Documents / शेरा / Save — config-driven जेणेकरून प्रत्येक विभागासाठी
 * वेगळा component लिहावा लागत नाही.
 */
export default function EntityCrudPage({
  title, subtitle, apiPath, docEntityType, auditEntityName, modalClassName, autoGenerateCode,
  columns, formFields, filterFields = [], defaultForm, extraParams = emptyParams, formNote,
  toolbarClassName = '', createInToolbar = false, toolbarSizing
}) {
  const { user, hydrated } = useAuth()
  const role = String(user?.role || '').trim().toLowerCase()
  // Public pages remain read-only. Accept legacy role casing in the client UI;
  // the backend remains the authority for every write operation.
  const canWrite = hydrated && ['admin', 'officer'].includes(role)
  const canDelete = hydrated && role === 'admin'

  const [items, setItems] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState({})
  const [loading, setLoading] = useState(false)

  const [modalMode, setModalMode] = useState(null) // 'create' | 'edit' | 'view'
  const [activeItem, setActiveItem] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [detailTab, setDetailTab] = useState('form')
  const autoCodeField = autoGenerateCode?.field
  const autoCodeCategoryField = autoGenerateCode?.categoryField
  const autoCodeEndpoint = autoGenerateCode?.endpoint
  const autoCodeCategory = autoCodeCategoryField ? form[autoCodeCategoryField] : undefined

  useEffect(() => {
    if (modalMode !== 'create' || !autoCodeEndpoint || !autoCodeField || !autoCodeCategory) return
    client.get(autoCodeEndpoint, { params: { category: autoCodeCategory } })
      .then((res) => setForm((current) => ({ ...current, [autoCodeField]: res.data.data })))
      .catch(() => setForm((current) => ({ ...current, [autoCodeField]: '' })))
  }, [modalMode, autoCodeCategory, autoCodeEndpoint, autoCodeField])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { pageNumber: page, pageSize: 10, searchTerm: search || undefined, ...filters, ...extraParams }
      const res = await client.get(apiPath, { params })
      setItems(res.data.data.items)
      setTotalPages(res.data.data.totalPages || 1)
      setError('')
    } catch (err) {
      setError(err.response?.data?.messageMr || 'माहिती लोड करता आली नाही.')
    } finally {
      setLoading(false)
    }
  }, [apiPath, page, search, filters, extraParams])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const openCreate = () => {
    setForm(defaultForm)
    setActiveItem(null)
    setModalMode('create')
    setDetailTab('form')
    setError('')
    setSuccess('')
    setFormErrors({})
  }

  const openEdit = (item) => {
    const f = { ...defaultForm }
    Object.keys(f).forEach((k) => { if (item[k] !== undefined) f[k] = item[k] })
    setForm(f)
    setActiveItem(item)
    setModalMode('edit')
    setDetailTab('form')
    setError('')
    setSuccess('')
    setFormErrors({})
  }

  const openView = (item) => {
    openEdit(item)
    setModalMode('view')
  }

  const closeModal = () => { setModalMode(null); setActiveItem(null) }

  const onFieldChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const validateForm = () => {
    const errors = {}
    const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9./_ -]*$/
    const dateFields = {}
    formFields.forEach((field) => {
      const value = form[field.name]
      const text = typeof value === 'string' ? value.trim() : value
      if (field.required && (text === '' || text === null || text === undefined)) {
        errors[field.name] = 'हे क्षेत्र आवश्यक आहे.'
        return
      }
      if (text === '' || text === null || text === undefined) return
      if (field.type === 'select' && !Object.prototype.hasOwnProperty.call(field.options || {}, value)) {
        errors[field.name] = 'कृपया वैध पर्याय निवडा.'
      } else if (field.type === 'number') {
        const number = Number(value)
        if (!Number.isFinite(number) || String(value).match(/[eE]/)) errors[field.name] = 'कृपया वैध संख्या भरा.'
        else if (number < 0) errors[field.name] = 'ऋण संख्या मान्य नाही.'
        else if (number > 1000000000000) errors[field.name] = 'रक्कम मर्यादेपेक्षा जास्त आहे.'
      } else if (field.type === 'date') {
        const date = new Date(`${value}T00:00:00`)
        const [year, month, day] = value.split('-').map(Number)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.getTime())
          || date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) errors[field.name] = 'कृपया वैध तारीख भरा.'
        else dateFields[field.name] = date
      } else if (typeof text === 'string' && text.length > (field.maxLength || 2000)) {
        errors[field.name] = `कमाल ${field.maxLength || 2000} अक्षरे परवानगी आहेत.`
      } else if (/(mobile|Mobile)$/.test(field.name) && !/^\d{10}$/.test(text)) {
        errors[field.name] = 'भ्रमणध्वनी क्रमांक 10 अंकी असावा.'
      } else if (field.name.toLowerCase() === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
        errors[field.name] = 'कृपया वैध ई-मेल भरा.'
      } else if (/(Number|Code|Deed|Notice|Survey|Tp|Registration|Document)/.test(field.name) && !identifierPattern.test(text)) {
        errors[field.name] = 'क्रमांकात अवैध अक्षरे आहेत.'
      }
    })
    if (dateFields.startDate && dateFields.endDate && dateFields.endDate < dateFields.startDate) errors.endDate = 'समाप्ती तारीख सुरुवातीच्या तारखेनंतर असावी.'
    if (dateFields.publishDate && dateFields.lastDateToApply && dateFields.lastDateToApply < dateFields.publishDate) errors.lastDateToApply = 'अंतिम तारीख प्रसिद्धी तारखेनंतर असावी.'
    if (dateFields.applicationDate && dateFields.decisionDate && dateFields.decisionDate < dateFields.applicationDate) errors.decisionDate = 'निर्णय तारीख अर्ज तारखेपूर्वी असू शकत नाही.'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const save = async () => {
    if (saving) return
    if (!validateForm()) {
      setError('कृपया दाखवलेल्या त्रुटी दुरुस्त करा.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const isEdit = Boolean(activeItem)
      if (isEdit) {
        await client.put(`${apiPath}/${activeItem.id}`, form)
      } else {
        await client.post(apiPath, form)
      }
      await load()
      setSuccess(isEdit ? 'नोंद यशस्वीरीत्या अद्ययावत झाली आहे.' : 'नवीन नोंद यशस्वीरीत्या जतन झाली आहे.')
      setForm(defaultForm)
      closeModal()
    } catch (err) {
      setError(err.response?.data?.messageMr || 'जतन करताना त्रुटी आली. कृपया माहिती तपासा.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item) => {
    if (!confirm('ही नोंद हटवायची आहे का? (Soft Delete)')) return
    await client.delete(`${apiPath}/${item.id}`)
    await load()
  }

  const readOnly = modalMode === 'view'

  return (
    <div className="bhoomi-page-container bhoomi-crud-page">
      <div className="page-header">
        <div>
          <div className="page-title">{title}</div>
          {subtitle && <div className="page-subtitle">{subtitle}</div>}
        </div>
        {canWrite && !createInToolbar && <button className="btn btn-primary" onClick={openCreate}>+ नवीन नोंद</button>}
      </div>

      <div className="card" style={{ padding: 16 }}>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
        <div className={`toolbar ${toolbarClassName}`.trim()}>
          <input className="input crud-search" style={toolbarSizing?.search ? { width: toolbarSizing.search, flex: `0 0 ${toolbarSizing.search}px` } : toolbarClassName ? undefined : { minWidth: 240 }} placeholder="🔍 शोधा (नाव, क्रमांक, इ.)"
            value={searchInput} onChange={(e) => { setPage(1); setSearchInput(e.target.value) }} />
          {filterFields.map((f) => (
            <select key={f.name} className="input crud-filter" style={toolbarSizing?.filters?.[f.name] ? { width: toolbarSizing.filters[f.name], flex: `0 0 ${toolbarSizing.filters[f.name]}px` } : undefined} value={filters[f.name] || ''}
              onChange={(e) => { setPage(1); setFilters((p) => ({ ...p, [f.name]: e.target.value || undefined })) }}>
              <option value="">{f.label} - सर्व</option>
              {Object.entries(f.options).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          ))}
          {canWrite && createInToolbar && <div className="crud-toolbar-action"><button className="btn btn-primary" onClick={openCreate}>+ नवीन नोंद</button></div>}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                <th>क्रिया</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(item) : (item[c.key] ?? '-')}</td>
                  ))}
                  <td style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openView(item)}>पाहा</button>
                    {canWrite && <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>संपादन</button>}
                    {canDelete && <button className="btn btn-danger btn-sm" onClick={() => remove(item)}>हटवा</button>}
                  </td>
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr><td colSpan={columns.length + 1}><div className="empty-state">कोणतीही नोंद सापडली नाही.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {modalMode && (
        <Modal
          title={modalMode === 'create' ? 'नवीन नोंद' : modalMode === 'view' ? 'तपशील पाहा' : 'नोंद संपादन'}
          onClose={closeModal}
          wide
          className={modalClassName}
          footer={
            <>
              <button className="btn btn-outline" onClick={closeModal}>बंद करा</button>
              {!readOnly && <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving && <span className="spinner" />} जतन करा (Save)
              </button>}
            </>
          }
        >
          <div className="tabs-row">
            <button className={'tab-chip' + (detailTab === 'form' ? ' active' : '')} onClick={() => setDetailTab('form')}>माहिती</button>
            {activeItem && <button className={'tab-chip' + (detailTab === 'docs' ? ' active' : '')} onClick={() => setDetailTab('docs')}>दस्तऐवज</button>}
            {activeItem && <button className={'tab-chip' + (detailTab === 'audit' ? ' active' : '')} onClick={() => setDetailTab('audit')}>बदल इतिहास</button>}
          </div>

          {error && <div className="error-msg">{error}</div>}

          {detailTab === 'form' && formNote && <div className="formula-note">{formNote}</div>}

          {detailTab === 'form' && (
            <div className="form-grid">
              {formFields.map((f) => (
                <div key={f.name} className={'form-field' + (f.full ? ' full' : '')}>
                  <label>{f.label}{f.required && ' *'}</label>
                  {f.type === 'select' ? (
                    <select disabled={readOnly} value={form[f.name] ?? ''} onChange={(e) => onFieldChange(f.name, e.target.value)}>
                      <option value="">-- निवडा --</option>
                      {Object.entries(f.options).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea disabled={readOnly} value={form[f.name] ?? ''} onChange={(e) => onFieldChange(f.name, e.target.value)} />
                  ) : f.type === 'propertyPicker' ? (
                    <PropertyPicker disabled={readOnly} value={form[f.name] ?? ''} onChange={(v) => onFieldChange(f.name, v)}
                      onPropertyLoaded={f.onPropertyLoaded ? (property) => f.onPropertyLoaded(property, onFieldChange, form) : undefined} />
                  ) : f.type === 'date' ? (
                    <input className="input" type="date" disabled={readOnly} min="1900-01-01" max="2099-12-31"
                      value={form[f.name] ?? ''}
                      onChange={(e) => {
                        const v = e.target.value
                        // चार अंकी वर्ष संरक्षण: yyyy-MM-dd स्वरूप आणि वर्ष बरोबर 4 अंकी असावे लागते.
                        if (v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v)) {
                          onFieldChange(f.name, v)
                        }
                      }} />
                  ) : (
                      <input className="input" type={f.type || 'text'} disabled={readOnly || (autoCodeField === f.name)}
                      value={form[f.name] ?? ''} onChange={(e) => onFieldChange(f.name, e.target.value)} />
                  )}
                  {formErrors[f.name] && <div className="error-msg">{formErrors[f.name]}</div>}
                </div>
              ))}
            </div>
          )}

          {detailTab === 'docs' && <DocumentsPanel entityType={docEntityType} entityId={activeItem?.id} canUpload={canWrite} />}
          {detailTab === 'audit' && <AuditPanel entityName={auditEntityName} entityId={activeItem?.id} />}
        </Modal>
      )}
    </div>
  )
}

function SearchablePropertySelect({ value, onChange, onPropertyLoaded, disabled }) {
  const [options, setOptions] = useState([])
  const [info, setInfo] = useState(null)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const containerRef = useRef(null)
  const isInitialRef = useRef(true)

  useEffect(() => {
    if (!propertyOptionsPromise) {
      propertyOptionsPromise = client.get('/properties', { params: { pageNumber: 1, pageSize: 500 } })
        .then((r) => Array.isArray(r.data?.data?.items) ? r.data.data.items : [])
        .catch((error) => {
          propertyOptionsPromise = undefined
          throw error
        })
    }
    propertyOptionsPromise.then(setOptions).catch(() => setOptions([]))
  }, [])

  useEffect(() => {
    const wasInitial = isInitialRef.current
    isInitialRef.current = false
    if (!value) { setInfo(null); return }

    propertyOptionsPromise?.then((propertyOptions) => {
      const property = propertyOptions.find((option) => String(option.id) === String(value))
      setInfo(property || null)
      if (!wasInitial && property && onPropertyLoaded) onPropertyLoaded(property)
    })
  }, [value, onPropertyLoaded])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const filteredOptions = options.filter((option) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    const wardLabel = PropertyWards[option.ward] || option.ward || ''
    const zoneLabel = PropertyZones[option.zone] || option.zone || ''
    const haystack = [
      option.propertyCode || '',
      option.name || '',
      option.currentOccupant || '',
      wardLabel,
      zoneLabel,
    ].join(' ').toLowerCase()
    return haystack.includes(term)
  })

  useEffect(() => {
    if (highlightIndex >= filteredOptions.length) setHighlightIndex(Math.max(filteredOptions.length - 1, 0))
  }, [filteredOptions.length, highlightIndex])

  const selectedOption = options.find((option) => String(option.id) === String(value)) || null

  const handleSelect = (selectedId) => {
    onChange(String(selectedId))
    setOpen(false)
    setSearch('')
  }

  const handleKeyDown = (event) => {
    if (!filteredOptions.length) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setHighlightIndex((current) => (current + 1) % filteredOptions.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setHighlightIndex((current) => (current - 1 + filteredOptions.length) % filteredOptions.length)
      return
    }

    if (event.key === 'Enter' && open) {
      event.preventDefault()
      const target = filteredOptions[highlightIndex]
      if (target) handleSelect(target.id)
      return
    }

    if (event.key === 'Escape') {
      setOpen(false)
      setSearch('')
    }
  }

  return (
    <div ref={containerRef} style={{ display: 'grid', gap: 8, position: 'relative' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
        <input
          className="input"
          type="text"
          value={search}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setSearch(event.target.value)
            setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder="मालमत्ता शोधा"
          disabled={disabled}
          style={{ flex: 1, minWidth: 0 }}
        />
        {search && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setSearch('')}
            style={{ minWidth: 42 }}
          >
            स्पष्ट
          </button>
        )}
      </div>

      <button
        type="button"
        className="input"
        disabled={disabled}
        aria-expanded={open}
        onClick={() => !disabled && setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          textAlign: 'left',
          background: '#fff',
          color: '#111827',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '10px 12px',
        }}
      >
        {selectedOption ? `${selectedOption.propertyCode || ''}${selectedOption.propertyCode && selectedOption.name ? ' - ' : ''}${selectedOption.name || ''}` : '-- मालमत्ता क्रमांक निवडा --'}
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 20,
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12)',
            maxHeight: 260,
            overflowY: 'auto',
            padding: 6,
          }}
        >
          {filteredOptions.length === 0 ? (
            <div style={{ padding: '10px 12px', color: '#6b7280' }}>मालमत्ता उपलब्ध नाही</div>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = String(option.id) === String(value)
              const isHighlighted = index === highlightIndex
              const wardLabel = PropertyWards[option.ward] || option.ward || ''
              const zoneLabel = PropertyZones[option.zone] || option.zone || ''
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onClick={() => handleSelect(option.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: isHighlighted ? '#eff6ff' : isSelected ? '#e0f2fe' : '#fff',
                    border: '1px solid transparent',
                    borderRadius: 6,
                    color: '#111827',
                    padding: '10px 12px',
                    marginBottom: 4,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{option.propertyCode || '—'} - {option.name || 'नाव उपलब्ध नाही'}</div>
                  <div style={{ fontSize: 12, color: '#4b5563' }}>
                    {option.currentOccupant ? `धारक: ${option.currentOccupant}` : 'धारक: —'} · {wardLabel ? `प्रभाग: ${wardLabel}` : 'प्रभाग: —'} · {zoneLabel ? `झोन: ${zoneLabel}` : 'झोन: —'}
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}

      {value && info && (
        <div className="property-info-fields">
          <div className="form-grid">
            <div className="form-field"><label>मालमत्ता प्रकार</label><input className="input" readOnly value={PropertyCategory[info.category] || info.category || ''} /></div>
            <div className="form-field"><label>नाव</label><input className="input" readOnly value={info.name || ''} /></div>
            <div className="form-field"><label>प्रभाग</label><input className="input" readOnly value={PropertyWards[info.ward] || info.ward || ''} /></div>
            <div className="form-field"><label>झोन</label><input className="input" readOnly value={PropertyZones[info.zone] || info.zone || ''} /></div>
            <div className="form-field full"><label>पत्ता</label><input className="input" readOnly value={info.address || ''} /></div>
            <div className="form-field"><label>क्षेत्रफळ</label><input className="input" readOnly value={info.areaSqFt ? `${info.areaSqFt} चौ.फूट` : ''} /></div>
            <div className="form-field"><label>मासिक भाडे</label><input className="input" readOnly value={`₹${Number(info.monthlyRent || 0).toLocaleString('en-IN')}`} /></div>
            <div className="form-field"><label>वार्षिक मागणी</label><input className="input" readOnly value={`₹${Number(info.annualDemand || 0).toLocaleString('en-IN')}`} /></div>
            <div className="form-field"><label>स्थिती</label><input className="input" readOnly value={PropertyStatus[info.status] || info.status || ''} /></div>
          </div>
        </div>
      )}
    </div>
  )
}

function PropertyPicker({ value, onChange, onPropertyLoaded, disabled }) {
  return (
    <SearchablePropertySelect
      value={value}
      onChange={onChange}
      onPropertyLoaded={onPropertyLoaded}
      disabled={disabled}
    />
  )
}
export { StatusBadge }
