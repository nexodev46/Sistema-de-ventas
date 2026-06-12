import { useEffect, useMemo, useState, FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { ArrowBack, Search as SearchIcon } from '@mui/icons-material'
import { searchService, type SearchResult } from '../../services/searchService'

export const Buscar = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchTerm, setSearchTerm] = useState(query)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setSearchTerm(query)
  }, [query])

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([])
        setError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const searchResults = await searchService.searchAll(query)
        setResults(searchResults)
      } catch (err) {
        setError('Error buscando resultados. Intenta nuevamente.')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query])

  const groupedResults = useMemo(
    () =>
      results.reduce<Record<string, SearchResult[]>>((groups, result) => {
        if (!groups[result.type]) groups[result.type] = []
        groups[result.type].push(result)
        return groups
      }, {}),
    [results]
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = searchTerm.trim()
    if (!trimmed) {
      setSearchParams({})
      return
    }
    setSearchParams({ q: trimmed })
  }

  const handleResultClick = (path: string) => {
    navigate(path)
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Búsqueda global
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Busca entre productos, clientes, ventas y devoluciones.
          </Typography>
        </Box>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
          Volver al Dashboard
        </Button>
      </Stack>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar productos, ventas, clientes..."
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ mt: 4 }}>
          {error}
        </Typography>
      ) : !query.trim() ? (
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Ingresa un término para buscar en el sistema.
          </Typography>
        </Box>
      ) : results.length === 0 ? (
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h6">No se encontraron resultados para "{query}".</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Intenta con otro término, como nombre de producto, número de venta o cliente.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={4}>
          {Object.entries(groupedResults).map(([type, items]) => (
            <Box key={type}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" textTransform="capitalize">
                  {type === 'producto'
                    ? 'Productos'
                    : type === 'cliente'
                    ? 'Clientes'
                    : type === 'venta'
                    ? 'Ventas'
                    : 'Devoluciones'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {items.length} resultado{items.length === 1 ? '' : 's'}
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                {items.map((result) => (
                  <Grid item xs={12} md={6} key={`${type}-${result.id}`}>
                    <Card>
                      <CardActionArea onClick={() => handleResultClick(result.path)}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            {result.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {result.subtitle}
                          </Typography>
                          {result.extra && (
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                              {result.extra}
                            </Typography>
                          )}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Stack>
      )}

      {query.trim() && results.length > 0 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Divider sx={{ flexGrow: 1, mr: 2, alignSelf: 'center' }} />
          <Typography variant="caption" color="text.secondary">
            Resultados basados en todos los datos cargados actualmente.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
