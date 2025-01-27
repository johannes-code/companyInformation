import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

export function CompanyList() {
  const [inputCompanyName, setInputCompanyName] = useState('');
  const [yearOptions, setYearOptions] = useState([]);
  const [searchParams, setSearchParams] = useState({ companyName: '', year: '', kommune: '' });

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1999 }, (_, index) => currentYear - index);
    setYearOptions(years);
  }, []);

  const fetchCompanies = useCallback(() => {
    let url = 'https://data.brreg.no/enhetsregisteret/api/enheter?size=100';
    if (searchParams.companyName) url += `&navn=${encodeURIComponent(searchParams.companyName)}`;
    if (searchParams.year) url += `&stiftelsesdatoFra=${searchParams.year}-01-01&stiftelsesdatoTil=${searchParams.year}-12-31`;
    if (searchParams.kommune) url += `&kommunenummer=${searchParams.kommune}`;
    console.log('Henter selskaper fra:', url);
    return fetch(url).then((res) => res.json());
  }, [searchParams]);

  const { isPending, error, data, refetch } = useQuery({
    queryKey: ['companies', searchParams],
    queryFn: fetchCompanies,
    enabled: false,
  });

  const { data: kommuneData } = useQuery({
    queryKey: ['kommuner'],
    queryFn: () =>
      fetch('https://data.brreg.no/enhetsregisteret/api/kommuner?size=100')
        .then((res) => res.json())
        .then((data) => {
          console.log('Kommuner hentet:', data);
          return data;
        }),
  });

  useEffect(() => {
    refetch();
  }, [searchParams, refetch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({
      companyName: inputCompanyName,
      year: document.getElementById('year').value,
      kommune: document.getElementById('kommune').value,
    });
  };

  const handleYearChange = (e) => {
    setSearchParams(prev => ({ ...prev, year: e.target.value }));
  };

  const handleKommuneChange = (e) => {
    setSearchParams(prev => ({ ...prev, kommune: e.target.value }));
  };

  if (isPending) return <div>Laster...</div>;
  if (error) return <div>En feil har oppstått: {error.message}</div>;

  const sortedKommuner = kommuneData?._embedded?.kommuner
    ?.map((by) => ({ navn: by.navn, nummer: by.kommunenummer }))
    .sort((a, b) => a.navn.localeCompare(b.navn, 'nb-NO')) || [];

  const filteredCompanies = data?._embedded?.enheter
    ?.filter(enhet => new Date(enhet.stiftelsesdato) >= new Date('2000-01-01'))
    .map((enhet) => ({
      navn: enhet.navn,
      stiftelsesdato: enhet.stiftelsesdato,
      organisasjonsnummer: enhet.organisasjonsnummer
    }))
    .sort((a, b) => a.navn.localeCompare(b.navn, 'nb-NO')) || [];

  return (
    <div>
      <section id="search-section">
        <form id="search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Selskapsnavn"
            value={inputCompanyName}
            onChange={(e) => setInputCompanyName(e.target.value)}
          />
          <select id="year" onChange={handleYearChange} value={searchParams.year}>
            <option value="">Velg år</option>
            {yearOptions.map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
          <select id="kommune" onChange={handleKommuneChange} value={searchParams.kommune}>
            <option value="">Velg kommune</option>
            {sortedKommuner.map((kommune) => (
              <option key={kommune.nummer} value={kommune.nummer}>
                {kommune.navn}
              </option>
            ))}
          </select>
          <button type="submit">Søk</button>
        </form>
      </section>

      <section id="result">
        {filteredCompanies.length > 0 ? (
          <div className="company-list">
            <div className="column">
              <h5>Selskapsnavn</h5>
              <ul>
                {filteredCompanies.map((enhet, index) => (
                  <li key={`name-${index}`}>{enhet.navn}</li>
                ))}
              </ul>
            </div>
            
            <div className="column">
              <h5>Stiftelsesdato</h5>
              <ul>
                {filteredCompanies.map((enhet, index) => (
                  <li key={`date-${index}`}>{enhet.stiftelsesdato}</li>
                ))}
              </ul>
            </div>
            
            <div className="column">
              <h5>Organisasjonsnummer</h5>
              <ul>
                {filteredCompanies.map((enhet, index) => (
                  <li key={`org-${index}`}>{enhet.organisasjonsnummer}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div>Ingen resultater funnet</div>
        )}
      </section>
    </div>
  );
}
