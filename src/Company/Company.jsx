import React, { useState, useCallback } from 'react';
import { useQuery } from 'react-query';

export function companyList(){}
  // State for søkeparametere
  const [searchParams, setSearchParams] = useState({
    companyName: '',
    year: '',
    kommune: '',
  });

  // Hent kommunedata fra API-et
  const { data: kommuneData, isLoading: isLoadingKommuner, error: kommuneError } = useQuery({
    queryKey: ['kommuner'],
    queryFn: () =>
      fetch('https://data.brreg.no/enhetsregisteret/api/kommuner?size=100')
        .then((res) => res.json())
        .then((data) => data._embedded.kommuner), // Tilpass til API-strukturen
  });

  // Funksjon for å hente selskaper basert på søkeparametere
  const fetchCompanies = useCallback(() => {
    let url = 'https://data.brreg.no/enhetsregisteret/api/enheter/?size=100';

    if (searchParams.companyName) {
      url += `&navn=${encodeURIComponent(searchParams.companyName)}`;
    }

    if (searchParams.year) {
      url += `&fraStiftelsesdato=${searchParams.year}-01-01&tilStiftelsesdato=${searchParams.year}-12-31`;
    }

    if (searchParams.kommune) {
      console.log('Kommune valgt:', searchParams.kommune);
      url += `&foretningsadresse.kommune=${encodeURIComponent(searchParams.kommune)}`;
    }

    console.log('Generert URL:', url);

    return fetch(url).then((res) => {
      if (!res.ok) {
        throw new Error(`Feil ved henting av selskaper: ${res.statusText}`);
      }
      return res.json();
    });
  }, [searchParams]);

  // React Query for å hente selskaper
  const { data: companyData, isLoading: isLoadingCompanies, error: companyError, refetch } = useQuery({
    queryKey: ['companies', searchParams],
    queryFn: fetchCompanies,
    enabled: false, // Må trigges manuelt med refetch()
  });

  // Håndter søkeknappen
  const handleSearch = () => {
    refetch();
  };

  // Håndter endring i nedtrekksmenyen
  const handleKommuneChange = (e) => {
    setSearchParams((prev) => ({
      ...prev,
      kommune: e.target.value,
    }));
  };

  // Håndter endring i firmanavn eller år
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Render komponenten
  return (
    <div>
      <h1>Søk etter selskaper</h1>

      {/* Kommunenedtrekksmeny */}
      {isLoadingKommuner ? (
        <p>Laster kommuner...</p>
      ) : kommuneError ? (
        <p>En feil oppstod ved henting av kommuner: {kommuneError.message}</p>
      ) : (
        <select value={searchParams.kommune} onChange={handleKommuneChange}>
          <option value="">Velg en kommune</option>
          {kommuneData.map((kommune) => (
            <option key={kommune.nummer} value={kommune.nummer}>
              {kommune.navn}
            </option>
          ))}
        </select>
      )}

      {/* Inputfelter for firmanavn og år */}
      <input
        type="text"
        name="companyName"
        placeholder="Firmanavn"
        value={searchParams.companyName}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="year"
        placeholder="År"
        value={searchParams.year}
        onChange={handleInputChange}
      />

      {/* Søkeknapp */}
      <button onClick={handleSearch}>Søk</button>

      {/* Vise resultater */}
      {isLoadingCompanies ? (
        <p>Laster selskaper...</p>
      ) : companyError ? (
        <p>En feil oppstod ved henting av selskaper: {companyError.message}</p>
      ) : companyData && companyData._embedded && companyData._embedded.enheter ? (
        <ul>
          {companyData._embedded.enheter.map((company) => (
            <li key={company.organisasjonsnummer}>
              {company.navn} (Org.nr: {company.organisasjonsnummer})
            </li>
          ))}
        </ul>
      ) : (
        <p>Ingen selskaper funnet.</p>
      )}
    </div>
  );
};

// Funksjon for å hente kommunedata fra API-et
const fetchApiData = () =>
  fetch('https://data.brreg.no/enhetsregisteret/api/kommuner?size=100')
    .then((res) => res.json())
    .then((data) => data._embedded.kommuner); // Tilpass til API-strukturen

