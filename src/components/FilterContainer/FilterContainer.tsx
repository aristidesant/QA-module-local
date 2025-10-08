import React from 'react';
import classes from './FilterContainer.module.css';

export const filterClasses = classes;

interface FilterContainerProps {
	children: React.ReactNode;
}

const FilterContainer: React.FC<FilterContainerProps> = ({ children }) => {
	return <div className={classes.filtersWrapper}>{children}</div>;
};

export default FilterContainer;
