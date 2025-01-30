import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {Modal} from '../components/modal/modal.jsx'

// Cookie-funksjoner
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function CompanyList() {
  const [inputCompanyName, setInputCompanyName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedKommune, setSelectedKommune] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [yearOptions, setYearOptions] = useState([]);
  const [searchParams, setSearchParams] = useState({
    companyName: "",
    year: "",
    kommuneNumber: "",
  });
  


  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 1999 },
      (_, index) => currentYear - index
    );
    setYearOptions(years);

    // Hent lagrede verdier fra cookies
    const savedCompanyName = getCookie("companyName");
    const savedYear = getCookie("year");
    const savedKommune = getCookie("kommune");


    if (savedCompanyName) setInputCompanyName(savedCompanyName);
    if (savedYear) setSelectedYear(savedYear);
    if (savedKommune) setSelectedKommune(savedKommune);
    
    // Oppdater searchParams med lagrede verdier
    setSearchParams((prev) => ({
      ...prev,
      companyName: savedCompanyName || "",
      year: savedYear || "",
      kommuneNumber: "",
    }));
  }, []);

  const { isPending, error, data, refetch } = useQuery({
    queryKey: ["companies", searchParams],
    queryFn: () => {
      let url =
        "https://data.brreg.no/enhetsregisteret/api/enheter?size=1000";
      if (searchParams.companyName)
        url += `&navn=${encodeURIComponent(searchParams.companyName)}`;
      if (searchParams.year)
        url += `&fraStiftelsesdato=${searchParams.year}-01-01&tilStiftelsesdato=${searchParams.year}-12-31`;
      if (searchParams.kommuneNumber) {
        url += `&kommunenummer=${searchParams.kommuneNumber}`;
      }
      return fetch(url).then((res) => res.json());
    },
    enabled: true,
  });

  const { data: kommuneData } = useQuery({
    queryKey: ["kommuner"],
    queryFn: () =>
      fetch(
        "https://data.brreg.no/enhetsregisteret/api/kommuner?size=1000"
      ).then((res) => res.json()),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const selectedKommune = kommuneData._embedded.kommuner.find(
      (k) => k.navn === document.getElementById("kommune").value
    );
    const selectedYear = document.getElementById("year").value;

    // Sett cookies
    setCookie("companyName", inputCompanyName, 7);
    setCookie("year", selectedYear, 7);
    setCookie(
      "kommune",
      selectedKommune ? selectedKommune.navn : "",
      7
    );

    setSearchParams({
      companyName: inputCompanyName,
      year: selectedYear,
      kommuneNumber: selectedKommune ? selectedKommune.nummer : "",
    });

    refetch();
  };

  const handleOpenModal = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  }

  if (isPending) return "Loading...";
  if (error)
    return "An error has occurred: " + error.message;

  const sortedKommuner =
    kommuneData?._embedded?.kommuner.sort((a, b) =>
      a.navn.localeCompare(b.navn, "nb-NO")
    ) || [];

  const filteredCompanies =
    data?._embedded?.enheter
      .filter(
        (enhet) =>
          new Date(enhet.stiftelsesdato) >= new Date("2000-01-01")
      )
      .map((enhet) => ({
        navn: enhet.navn,
        stiftelsesdato: enhet.stiftelsesdato,
        organisasjonsnummer: enhet.organisasjonsnummer,
        kommune:
          enhet.forretningsadresse?.kommune,
        aktivitet: enhet.aktivitet,
        regnskap: enhet.sisteInsendteAarsregnskap,
        konkurs: enhet.konkurs

        || "N/A",
      }))
      .sort((a, b) =>
        a.navn.localeCompare(b.navn, "nb-NO")
      ) || [];

  
  return (
    <div>
      <section id="search-section">
        <form id="search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Company Name"
            value={inputCompanyName}
            onChange={(e) =>
              setInputCompanyName(e.target.value)
            }
          />
          <select id="year" 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Select Year</option>
          {yearOptions.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
          </select>
          <select id="kommune" 
          value={selectedKommune} 
          onChange={(e) => setSelectedKommune(e.target.value)}
          >
          <option value="">Velg kommune</option>
          {sortedKommuner.map((kommune) => (
          <option key={kommune.nummer} value={kommune.navn}>
          {kommune.navn}
          </option>
          ))}
            </select>
          <button type="submit">Search</button>
        </form>
      </section>

      <section id="result">
        <div className="company-list">
          <div className="column">
            <h5>Company Name</h5>
            <ul>
              {filteredCompanies.map((company) => (
                <li
                  key={`name-${company.organisasjonsnummer}`}
                  onClick={() => handleOpenModal(company)}
                  style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline'}}
                >
                  {company.navn}
                </li>
              ))}
            </ul>
          </div>

          <div className="column">
            <h5>Establishment Date</h5>
            <ul>
              {filteredCompanies.map((company) => (
                <li
                  key={`date-${company.organisasjonsnummer}`}
                >
                  {company.stiftelsesdato}
                </li>
              ))}
            </ul>
          </div>

          <div className="column">
            <h5>Organization Number</h5>
            <ul>
              {filteredCompanies.map((company) => (
                <li
                  key={`org-${company.organisasjonsnummer}`}
                >
                  {company.organisasjonsnummer}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <Modal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isBankrupt={selectedCompany?.konkurs}
        >
          {selectedCompany && (
        <>
          <h2>{selectedCompany.navn}</h2>
          {selectedCompany.konkurs && (
            <p style={{ color: 'red', fontWeight: 'bold', fontSize: '24px'}}>
              OBS: Denne bedriften er konkurs!
              </p>
          )}
          <p>Establisment Date: {selectedCompany.stiftelsesdato}</p>
          <p>Organization Number: {selectedCompany.organisasjonsnummer}</p>
          <p>commune: {selectedCompany.kommune}</p>
          <p>Activity: {selectedCompany.aktivitet}</p>
          <p>Last Annual Accounts:{selectedCompany.sisteInsendteAarsregnskap}</p>
        </>
      )}
      </Modal>
    </div>
  );
}

