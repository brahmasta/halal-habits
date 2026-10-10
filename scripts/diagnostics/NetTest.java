// Quick check that this JVM can open outbound HTTPS connections (Avira/firewall diagnosis).
// Run: & "<jdk>binjava.exe" .scriptsdiagnosticsNetTest.java
import java.net.*;
public class NetTest {
  public static void main(String[] a) throws Exception {
    for (String h : new String[]{"repo.maven.apache.org","dl.google.com","plugins.gradle.org"}) {
      for (InetAddress ip : InetAddress.getAllByName(h)) {
        long t = System.currentTimeMillis();
        try (Socket s = new Socket()) { s.connect(new InetSocketAddress(ip, 443), 4000); System.out.println(h+" "+ip.getHostAddress()+" OK "+(System.currentTimeMillis()-t)+"ms"); }
        catch (Exception e) { System.out.println(h+" "+ip.getHostAddress()+" FAIL "+e.getClass().getSimpleName()); }
      }
    }
  }
}
