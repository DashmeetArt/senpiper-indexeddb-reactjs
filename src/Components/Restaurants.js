import React, { useState, useEffect, useRef } from 'react';
import RestaurantCard from './RestaurantCard';

import restaurantList from '../indexedDb';

function Restaurants(props) {

	const [isSearching, setIsSearching] = useState(true);
    const [restaurants, setRestaurants] = useState({
    	isSearching: true,
        nextCursor: {
            next: null,
            term: '',
            hasNext: true,
            group: undefined,
        },
        totalResultFetched: 0,
        group: undefined,
        list: [],
        groups: {}
    });
    const [observerEntry, setEntry] = useState({});
    const elRef = useRef();

    // runs only once.
    useEffect(() => {
        if (elRef.current) {
	        // adding ref to loading element, so that whenever it comes in view, new items get loaded.
	        const observer = new IntersectionObserver(
	            entries => setEntry(entries[0]),
	            { threshold: 1 }
	        );

	        observer.observe(elRef.current);
	        return () => observer.disconnect();
    	}
    }, [restaurants.nextCursor.hasNext])


    // runs every time search term changes.
    useEffect(() => {
    	setIsSearching(true);
    	restaurantList.search(props.search || '', (error, result) => {
	        setRestaurants(prev => {
	        	const groupName = result.cursor.group;
	        	const newGroups = Object.assign({}, {
	        		[groupName]: result.items
	        	})

	            return {
	                ...prev,
	                list: result.items,
	                nextCursor: result.cursor,
	                groups: newGroups,
	                totalResultFetched: result.items.length
	            }
	        })

	        setIsSearching(false);
	    })
    }, [props.search])

    useEffect(() => {
    	if (
	        observerEntry.isIntersecting &&
	        restaurants.nextCursor.hasNext &&
	        restaurants.nextCursor.next &&
	        !isSearching
	    ) {
	    	setIsSearching(true);
	        restaurantList.next(restaurants.nextCursor, (error, result) => {
	            setRestaurants(prev => {
	            	const groupName = result.cursor.group;
	            	const newGroups = Object.assign({}, prev.groups, {
	            		[groupName]: [...(prev.groups[groupName] || []), ...result.items]
	            	})

		            return {
		                ...prev,
		                list: [...prev.list, ...result.items],
		                nextCursor: result.cursor,
		                groups: newGroups,
		                totalResultFetched: prev.totalResultFetched + result.items.length
		            }
	            })
				
				setIsSearching(false);
	        });
		}
    }, [observerEntry.isIntersecting, isSearching, restaurants.nextCursor])

	return (
		<div className="listContainer">
			{
				Object.keys(restaurants.groups).map((key, index) => {
					const list = restaurants.groups[key];
					const groupHeading = list.length > 0 ? (
						<div
							key={`hola-${key}-${index}`}
							className='groupHeading'
						>{key}</div>
					) : null;

					const groupList = list.length > 0 && (
						<ul className="list" key={`list-${index}`}>
							{ props.search ? groupHeading : null }
							{
								list.map(restaurant => {
				                	return RestaurantCard({...restaurant, term: props.search, group: key})
				            	})
							}
						</ul>
					)

					return groupList;
				})
			}
			
			<div className="loaderContainer">
				{
		        	restaurants.nextCursor.hasNext ?
		        	<div ref={elRef} >
						Loading
					</div>
					:
					<div>
						{
							restaurants.totalResultFetched === 0 ?
							'No Result Found' :
							'No More Results'
						}
					</div>
			    }
			</div>
	    </div>
	)
}

export default Restaurants;