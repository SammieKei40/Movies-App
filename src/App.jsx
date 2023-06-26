import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import { Search } from "./Search";
import { NumResults } from "./NumResults";


const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

  const KEY = "1f942096"

  export default function App() {
    const [movies, setMovies] = useState([]);
    const [watched, setWatched] = useState([]);
    const [isLoading, setisLoading] = useState(false)
    const [error, setError] = useState("")
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(null)


    function handleSelectMovie(id){
      setSelectedId((selectedId) => (id === selectedId ? null : id))
    }

    function handleCloseMovie(){
      setSelectedId(null)
    }

    function handleAddWatched(movie){
      setWatched(watched => [...watched, movie])
    }

    function handleDeleteWatched(id){
      setWatched((watched) => watched.filter((movie) => movie.imdbID !== id))
    }

    useEffect(function() {
      const controller = new AbortController()

      async function fetchMovies(){
        try { 
        setisLoading(true)
        setError("")
        const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {signal: controller.signal})

     if(!res.ok) throw new Error("Something went wrong")
      const data = await res.json()
      if(data.Response === "False") throw new Error("Movie not found")
      setMovies(data.Search)
      setError("")
    } catch (err){
      if(err.name !== "AbortError"){
        setError(err.message)
      }
    } finally { setisLoading(false) 
      }
    }

    if(query.length < 3){
      setMovies([])
      setError("")
      return
    }
      fetchMovies();

      return function(){
        controller.abort()
      }
    }, [query])

    return (
      <>
      <NavBar>
        <Search query={query} setQuery={setQuery}/>
        <NumResults movies={movies}/>
      </NavBar>
      <Main>
        <Box element={isLoading && <Loader/> 
        || !isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie} /> || 
        error && <ErrorMessage message={error}/>}/>

        <Box element={selectedId ? (<MoviesDetails selectedId={selectedId} onCloseMovie={handleCloseMovie} 
        onaddWatched={handleAddWatched}
        watched={watched}
        /> ) : (
          <>
          <WatchedSummary watched={watched}/>
          <WatchedMoviesList watched={watched} onDeleteWatched={handleDeleteWatched}/>
          </>
          )}
          />
        
        {/* <Box>
        {isLoading && <Loader/>} 
        {!isLoading && !error && <MovieList movies={movies}/>} 
        {error && <ErrorMessage message={error}/>}
        </Box>

        <Box>
          <>
          <WatchedSummary watched={watched}/>
          <WatchedMoviesList watched={watched}/>
          </>
        </Box> */}
      </Main> 
      </>
    );
  }

  function Loader(){
    return <p className="loader">Loading...</p>
  }

  function ErrorMessage({message}){
    return <p className="error">
        <span>❌</span> {message}
      </p>
  }

 function NavBar({children}){
    return (
      <>
      <nav className="nav-bar">
        <Logo />
        {children}
      </nav>
      </>
    )
  }

  function Logo(){
    return (
      <div className="logo">
          <span role="img">🍿</span>
          <h1>usePopcorn</h1>
        </div>
    )
  }

  function Main({children}){
  
    return (
      <>
        <main className="main">
          {children}
        
      </main>
      </>
    )
  }

  function Box({element}){
    const [isOpen, setIsOpen] = useState(true);   

    return (
      <div className="box">
          <button
            className="btn-toggle"
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? "–" : "+"}
          </button>
          {isOpen && element}
        </div>
    )
  }

  function MovieList({movies, onSelectMovie}){
    return (
      <ul className="list list-movies">
              {movies?.map((movie) => (
                <li key={movie.imdbID} onClick={() => onSelectMovie(movie.imdbID)}>
                  <img src={movie.Poster} alt={`${movie.Title} poster`} />
                  <h3>{movie.Title}</h3>
                  <div>
                    <p>
                      <span>🗓</span>
                      <span>{movie.Year}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
    )
  }

  // function WatchedBox(){
  //   const [watched, setWatched] = useState(tempWatchedData);
  //   const [isOpen2, setIsOpen2] = useState(true);
  
    

  //   return (
  //     <div className="box">
  //         <button
  //           className="btn-toggle"
  //           onClick={() => setIsOpen2((open) => !open)}
  //         >
  //           {isOpen2 ? "–" : "+"}
  //         </button>
  //         {isOpen2 && (
  //           <>
  //             <WatchedSummary watched={watched}/>
  //             <WatchedMoviesList watched={watched}/>
              
  //           </>
  //         )}
  //       </div>
  //   )
  // }

function MoviesDetails({selectedId , onCloseMovie, onaddWatched, watched}){
  const [movie, setMovie] = useState({})
  const [isLoading, setisLoading] = useState(false)
  const [userRating, setUserRating] = useState({})

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId)
  const watchedUserRating = watched.find((movie) => movie.imdbID === selectedId)?.userRating

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre
  } =  movie

function handleAdd(){
  const newWatchedMovie = {
    imdbID: selectedId,
    title,
    year,
    poster,
    imdbRating: Number(imdbRating),
    runtime: Number(runtime.split("").at(0)),
    userRating
  }

  onaddWatched(newWatchedMovie)
  onCloseMovie()
}

    useEffect(function(){
      async function getMoviesDetails(){
        setisLoading(true)
        const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`)

        const data = await res.json()
        setMovie(data)
        setisLoading(false)
      }
      getMoviesDetails()
    }, [selectedId])

    useEffect(function() {
      if(!title) return
      document.title = `Movie: ${title}`

      return function(){
        document.title = "Movies App"
      }
    }, [title])

  return <div className="details">
    {isLoading ? <Loader/> : (
    <>
    <header>
    <button className="btn-back" onClick={onCloseMovie}>
      &larr;
    </button>
    <img src={poster} alt={`Poster of ${movie}`}/>
    <div className="details-overview">
      <h2>{title}</h2>
      <p>
        {released} &bull; {runtime}
      </p>
      <p>{genre}</p>
      <p><span>⭐</span>
        {imdbRating} IMDB rating
      </p>
    </div>
    </header>

    <section>
      <div className="rating">
        {!isWatched ? (
          <>
        <StarRating maxRating={10} size={24} onSetRating={setUserRating}/>

        {userRating > 0 && (<button className="btn-add" onClick={handleAdd}>
          + Add to list
        </button>
        )}
        </>
       )  :  (<p>You rated this movie {watchedUserRating} ⭐</p>
        )}
      </div>
      <p>
        <em>{plot}</em>
      </p>
      <p>Starring {actors}</p>
      <p>Directed by {director}</p>
    </section>
    </>
  )}
  </div>
}

  function WatchedSummary({watched}){
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));
    return (
      <div className="summary">
                <h2>Movies you watched</h2>
                <div>
                  <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                  </p>
                  <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating.toFixed()}</span>
                  </p>
                  <p>
                    <span>🌟</span>
                    <span>{avgUserRating.toFixed()}</span>
                  </p>
                  <p>
                    <span>⏳</span>
                    <span>{avgRuntime} min</span>
                  </p>
                </div>
              </div>
    )
  }

function WatchedMoviesList({watched, onDeleteWatched}){
  return (
    <ul className="list">
                {watched.map((movie) => (
                  <li key={movie.imdbID} onDeleteWatched={onDeleteWatched}>
                    <img src={movie.poster} alt={`${movie.title} poster`} />
                    <h3>{movie.title}</h3>
                    <div>
                      <p>
                        <span>⭐️</span>
                        <span>{movie.imdbRating}</span>
                      </p>
                      <p>
                        <span>🌟</span>
                        <span>{movie.userRating}</span>
                      </p>
                      <p>
                        <span>⏳</span>
                        <span>{movie.runtime} min</span>
                      </p>

                      <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>X</button>
                    </div>
                  </li>
                ))}
              </ul>
  )
}