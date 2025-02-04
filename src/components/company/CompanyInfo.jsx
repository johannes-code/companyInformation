export const CompanyInfo = ({
  filteredCompanies,
  info,
  title,
  resultStyles,
}) => {
  return (
    <div className={resultStyles.column}>
      <h5>{title}</h5>
      <ul>
        {filteredCompanies.map((company) => (
          <li key={`name-${company.organisasjonsnummer}`}>{company[info]}</li>
        ))}
      </ul>
    </div>
  );
};
