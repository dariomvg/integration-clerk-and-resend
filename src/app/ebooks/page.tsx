import { useRouter } from "next/navigation";


export default function EbooksPage () {

  const router = useRouter();  

  return router.push("/");

  return (<div>Ebooks Page</div>)
}